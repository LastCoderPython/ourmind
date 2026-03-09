import uuid
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
import shutil
import os
import traceback
from services.emotion_service import emotion_service
from services.llm_service import llm_service
from services.audio_service import audio_service
from utils.auth_utils import get_current_user
from database.supabase_client import get_db_client

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    message: str
    session_id: str

class EmotionScore(BaseModel):
    label: str
    score: float

class HelplineInfo(BaseModel):
    name: str
    number: str
    description: str

class CrisisInfo(BaseModel):
    crisis_trigger: bool
    crisis_reasons: list[str] = []
    helplines: list[HelplineInfo] = []

class DistressScore(BaseModel):
    label: str
    score: float

class ChatResponse(BaseModel):
    session_id: str
    response: str
    suggested_tasks: list[str]
    detected_language: str
    emotions: list[EmotionScore]
    distress_scores: list[DistressScore]
    dominant_emotion: str
    crisis: CrisisInfo

@router.post("", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest, user_id: str = Depends(get_current_user)):
    """
    1. Analyzes user message for emotions and distress.
    2. Checks for crisis triggers.
    3. Generates empathetic response via LLM.
    4. Saves the entire conversation turn to Supabase.
    """
    db = get_db_client()

    try:
        # Step 1: Emotion & Distress Triage
        analysis = emotion_service.analyze(request.message)

        # Step 2: LLM Generation
        ai_response, ai_tasks, detected_language = llm_service.get_response(request.message, request.session_id)

        # Step 3: Save User Message & Assistant Message
        user_msg = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "session_id": request.session_id,
            "role": "user",
            "content": request.message
        }
        assistant_msg = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "session_id": request.session_id,
            "role": "assistant",
            "content": ai_response
        }
        db.table("messages").insert([user_msg, assistant_msg]).execute()
        
        # Step 4: Save dynamically generated tasks to DB Gamification
        from datetime import date
        today_date = date.today().isoformat()
        if ai_tasks:
            task_inserts = []
            for task_desc in ai_tasks:
                task_inserts.append({
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "description": str(task_desc),
                    "completed": False,
                    "date": today_date
                })
            try:
                db.table("tasks").insert(task_inserts).execute()
            except Exception as e:
                print(f"[Supabase Warning] Failed to log dynamic tasks: {str(e)}")

        # Step 5: Format the final payload
        crisis_info = CrisisInfo(
            crisis_trigger=analysis["crisis_trigger"],
            crisis_reasons=analysis.get("crisis_reasons", []),
            helplines=[HelplineInfo(**h) for h in analysis.get("helplines", [])]
        )

        emotion_scores = [EmotionScore(label=k, score=v) for k, v in analysis["emotions"].items()]
        distress_scores_list = [DistressScore(label=k, score=v) for k, v in analysis["distress_scores"].items()]

        return ChatResponse(
            session_id=request.session_id,
            response=ai_response,
            suggested_tasks=ai_tasks,
            detected_language=detected_language,
            emotions=emotion_scores,
            distress_scores=distress_scores_list,
            dominant_emotion=analysis["dominant_emotion"],
            crisis=crisis_info
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@router.post("/voice")
async def voice_chat_endpoint(
    background_tasks: BackgroundTasks,
    audio_file: UploadFile = File(...),
    session_id: str = Form(...),
    user_id: str = Depends(get_current_user)
):
    """
    1. Receives audio file.
    2. Transcribes using Groq Whisper.
    3. Generates response using Groq Llama 3 and captures emotion.
    4. Converts response to audio using Cartesia Sonic API.
    5. Returns audio file.
    """
    db = get_db_client()
    
    # Save temporary input file
    temp_input_path = f"temp_input_{uuid.uuid4()}.webm"
    temp_output_path = f"temp_output_{uuid.uuid4()}.mp3"
    
    try:
        with open(temp_input_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
            
        # 1. Speech to Text
        print("[VOICE DEBUG] Step 1: STT...")
        user_text = audio_service.transcribe_audio(temp_input_path)
        print(f"[VOICE DEBUG] Step 1 DONE. Transcript: {user_text[:50]}")
        
        # 2. Analyze Emotion
        print("[VOICE DEBUG] Step 2: Emotion...")
        analysis = emotion_service.analyze(user_text)
        detected_emotion = analysis["dominant_emotion"]
        print(f"[VOICE DEBUG] Step 2 DONE. Emotion: {detected_emotion}")
        
        # 3. Request LLM
        print("[VOICE DEBUG] Step 3: LLM...")
        ai_response, ai_tasks, detected_language = llm_service.get_response(user_text, session_id)
        print(f"[VOICE DEBUG] Step 3 DONE. Lang: {detected_language}, Response[:50]: {ai_response[:50]}")
        
        # 4. Save to Database (Graceful degrade if table is missing)
        try:
            user_msg = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "session_id": session_id,
                "role": "user",
                "content": user_text
            }
            assistant_msg = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "session_id": session_id,
                "role": "assistant",
                "content": ai_response
            }
            db.table("messages").insert([user_msg, assistant_msg]).execute()
            
            # Insert Gamification tasks
            if ai_tasks:
                from datetime import date
                today_date = date.today().isoformat()
                task_inserts = []
                for task_desc in ai_tasks:
                    task_inserts.append({
                        "id": str(uuid.uuid4()),
                        "user_id": user_id,
                        "description": str(task_desc),
                        "completed": False,
                        "date": today_date
                    })
                db.table("tasks").insert(task_inserts).execute()
                
        except Exception as db_e:
            print(f"[Supabase Warning] Failed to log messages/tasks to DB: {str(db_e)}")
        
        # 5. Text to Speech (Cartesia)
        print(f"[VOICE DEBUG] Step 5: TTS with emotion={detected_emotion}, lang={detected_language}...")
        output_file_path = audio_service.generate_speech(ai_response, temp_output_path, detected_emotion, detected_language)
        print(f"[VOICE DEBUG] Step 5 DONE. Audio file: {output_file_path}")
        
        # Cleanup input file
        if os.path.exists(temp_input_path):
            os.remove(temp_input_path)
            
        # Return file and add background task to clean it up after response
        background_tasks.add_task(os.remove, output_file_path)
        
        # URL-encode header values: HTTP headers only support ASCII characters.
        # Hindi transcript from Whisper and LLM responses with emojis crash without encoding.
        from urllib.parse import quote
        
        return FileResponse(
            output_file_path, 
            media_type="audio/mpeg", 
            headers={
                "X-User-Transcript": quote(user_text, safe=''), 
                "X-AI-Response": quote(ai_response, safe=''),
                "X-AI-Tasks": quote(str(ai_tasks), safe=''),
                "X-AI-Language": detected_language
            } 
        )
        
    except Exception as e:
        # Write full traceback to file for debugging
        import traceback as tb
        with open("voice_debug.log", "w", encoding="utf-8") as log_f:
            tb.print_exc(file=log_f)
        traceback.print_exc()
        if os.path.exists(temp_input_path):
            os.remove(temp_input_path)
        if os.path.exists(temp_output_path):
            os.remove(temp_output_path)
        raise HTTPException(status_code=500, detail=f"Voice Error: {str(e)}")


import uuid
from datetime import date
from typing import Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from utils.auth_utils import get_current_user
from database.supabase_client import get_db_client

router = APIRouter(tags=["Mood Insights"])

# We are using basic dictionaries for input parsing if it's dynamic
class MoodLogRequest(BaseModel):
    emotion: str
    intensity: float

@router.post("/api/mood")
def log_daily_mood(request: MoodLogRequest, user_auth: tuple[str, dict] = Depends(get_current_user)):
    user_id, _ = user_auth
    """Logs the inferred dominant emotion from the daily check-in conversation."""
    db = get_db_client()
    today = date.today().isoformat()

    mood_entry = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "emotion": request.emotion,
        "intensity": request.intensity,
        "date": today
    }
    
    try:
        # Supabase returns the inserted data
        response = db.table("mood_logs").insert(mood_entry).execute()
        return {"status": "success", "logged_mood": request.emotion}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/moods/history")
def get_mood_history(user_auth: tuple[str, dict] = Depends(get_current_user)):
    user_id, _ = user_auth
    """Fetches the actual mood history for the Recharts frontend."""
    db = get_db_client()
    
    try:
        # Fetch the last 14 logs ordered by date
        response = db.table("mood_logs").select("*").eq("user_id", user_id).order("date", desc=True).limit(14).execute()
        # Return in ascending order for charting
        data = response.data
        data.reverse()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/weather")
def get_emotional_weather(user_auth: tuple[str, dict] = Depends(get_current_user)):
    user_id, _ = user_auth
    """
    Calculates the 'weather' based on the intensity of distress/negative emotions 
    over the last 5 days. Since we store positive dominant emotions, we heuristic map it.
    """
    db = get_db_client()
    
    try:
        response = db.table("mood_logs").select("*").eq("user_id", user_id).order("date", desc=True).limit(5).execute()
        logs = response.data
        
        if not logs:
            return {"overall": "Unknown", "temperature": "", "description": "Not enough data yet."}

        # Naive implementation: 
        # If mean intensity of joy/happiness is high -> Sunny
        # If sadness/fear is high -> Storm
        negative_emotions = {"sadness", "fear", "nervousness", "grief", "anger", "disappointment", "remorse"}
        
        neg_score = 0.0
        for log in logs:
            if log["emotion"] in negative_emotions:
                neg_score += log["intensity"]
            else:
                neg_score -= (log["intensity"] * 0.5) # Positive emotions reduce the storm
                
        # Normalize roughly
        avg_neg = max(0.0, min(1.0, (neg_score / len(logs)) + 0.5))
        
        if avg_neg > 0.8:
            return {"overall": "Stormy", "temperature": "", "description": "You've been experiencing heavy emotional storms lately."}
        elif avg_neg > 0.6:
            return {"overall": "Rainy", "temperature": "", "description": "It's been a rainy, difficult few days."}
        elif avg_neg > 0.4:
            return {"overall": "Cloudy", "temperature": "", "description": "Things have felt a bit cloudy and neutral."}
        elif avg_neg > 0.2:
            return {"overall": "Cloudy", "temperature": "", "description": "You've been mostly calm recently."}
        else:
            return {"overall": "Sunny", "temperature": "", "description": "It's been very bright and sunny!"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

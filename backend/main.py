"""
OurMind – AI Mental Health Companion API
=========================================
FastAPI backend with dual-model emotion/distress analysis (GoEmotions +
multilingual sentiment) and local LLM counselling (Llama 3.1 8B 4-bit).
"""

from contextlib import asynccontextmanager
from datetime import date, timedelta
from typing import Optional
import random
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

from services.emotion_service import emotion_service
from services.llm_service import llm_service


# ── Pydantic Models ──────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    """Incoming chat request from the frontend."""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    session_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique session identifier",
    )
    language: str = Field(default="en", description="Preferred language code")


class EmotionScore(BaseModel):
    """Individual emotion label and its confidence score."""
    label: str
    score: float


class HelplineInfo(BaseModel):
    """Verified helpline contact."""
    name: str
    number: str
    description: str


class DistressScore(BaseModel):
    """Multilingual distress sentiment score."""
    label: str
    score: float


class CrisisInfo(BaseModel):
    """Crisis alert payload with dual-model reasoning."""
    crisis_trigger: bool = False
    crisis_reasons: list[str] = []
    helplines: list[HelplineInfo] = []


class ChatResponse(BaseModel):
    """Full response returned from POST /api/chat."""
    session_id: str
    response: str
    emotions: list[EmotionScore]
    distress_scores: list[DistressScore]
    dominant_emotion: str
    crisis: CrisisInfo


class MoodEntry(BaseModel):
    """Single data point for the mood dashboard."""
    date: str
    emotion: str
    intensity: float


# ── Lifespan (model loading) ────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models on startup, clean up on shutdown."""
    print("=" * 60)
    print("  OurMind Backend – Starting Up")
    print("=" * 60)

    # 1. Load lightweight emotion model first
    emotion_service.load_model()

    # 2. Load large LLM
    llm_service.load_model()

    print("=" * 60)
    print("  [OK] All models loaded. Server is ready.")
    print("=" * 60)

    yield  # ← app runs here

    print("[Shutdown] Cleaning up resources...")


# ── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="OurMind – Mental Health Companion API",
    description=(
        "AI-powered mental health companion for university students "
        "in North East India. Features real-time emotion analysis and "
        "CBT-based conversational counselling."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS – allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    """Health-check / landing endpoint."""
    return {
        "service": "OurMind Mental Health Companion API",
        "status": "running",
        "version": "1.0.0",
    }


@app.post("/api/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Process a user message:
    1. Dual-model emotion + distress analysis (GoEmotions + multilingual)
    2. Generate counselling response (local Llama 3.1 8B on CUDA)
    3. Return combined result with crisis flags if applicable
    """
    try:
        # ── Step 1: Dual-Model Emotion & Distress Analysis ───────────────
        analysis = emotion_service.analyze(request.message)

        emotion_scores = [
            EmotionScore(label=label, score=score)
            for label, score in analysis["emotions"].items()
        ]

        distress_scores = [
            DistressScore(label=label, score=score)
            for label, score in analysis["distress_scores"].items()
        ]

        crisis = CrisisInfo(
            crisis_trigger=analysis["crisis_trigger"],
            crisis_reasons=analysis.get("crisis_reasons", []),
            helplines=[
                HelplineInfo(**h) for h in analysis.get("helplines", [])
            ],
        )

        # ── Step 2: LLM Response ─────────────────────────────────────────
        ai_response = llm_service.get_response(
            message=request.message,
            session_id=request.session_id,
        )

        return ChatResponse(
            session_id=request.session_id,
            response=ai_response,
            emotions=emotion_scores,
            distress_scores=distress_scores,
            dominant_emotion=analysis["dominant_emotion"],
            crisis=crisis,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


@app.get(
    "/api/dashboard/{session_id}",
    response_model=list[MoodEntry],
    tags=["Dashboard"],
)
async def get_dashboard(session_id: str):
    """
    Return mock historical mood scores for a given session.

    Generates 14 days of sample data suitable for a Recharts line graph
    with Date on the x-axis and Intensity on the y-axis, colored by Emotion.
    """
    emotions = ["joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"]
    today = date.today()

    mock_data: list[MoodEntry] = []
    for day_offset in range(14):
        current_date = today - timedelta(days=13 - day_offset)
        # Pick a dominant emotion with realistic-looking intensities
        dominant = random.choice(emotions)
        intensity = round(random.uniform(0.3, 0.95), 2)
        mock_data.append(
            MoodEntry(
                date=current_date.isoformat(),
                emotion=dominant,
                intensity=intensity,
            )
        )

    return mock_data


# ── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

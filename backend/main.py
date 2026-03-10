"""
Manas – AI Mental Health Companion API
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
from services.audio_service import audio_service
from routers import chat_router, mood_router, task_router, garden_router, community_router


# ── Pydantic Models ──────────────────────────────────────────────────────────

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
    print("  Manas Backend – Starting Up")
    print("=" * 60)

    # 1. Load lightweight emotion model first
    emotion_service.load_model()

    # 2. Load large LLM
    llm_service.load_model()
    
    # 3. Load Audio APIs (Voice STT/TTS)
    audio_service.load_clients()

    print("=" * 60)
    print("  [OK] All models loaded. Server is ready.")
    print("=" * 60)

    yield  # ← app runs here

    print("[Shutdown] Cleaning up resources...")


# ── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="Manas – Mental Health Companion API",
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
        "service": "Manas Mental Health Companion API",
        "status": "running",
        "version": "1.0.0",
    }


# ── TEMPORARY DEBUG ENDPOINT — REMOVE AFTER FIXING AUTH ──────────────────────
@app.get("/debug/auth", tags=["Debug"])
async def debug_auth(token: str = ""):
    """Temporary endpoint to diagnose JWT verification issues."""
    import base64, hmac, hashlib, json, os

    raw_secret = os.environ.get("SUPABASE_JWT_SECRET", "")
    info = {
        "secret_length": len(raw_secret),
        "secret_first_4": raw_secret[:4] if raw_secret else "EMPTY",
        "secret_looks_like_jwt": raw_secret.count(".") == 2 and raw_secret.startswith("eyJ"),
    }

    if not token:
        info["message"] = "Pass ?token=YOUR_JWT to test verification"
        return info

    # Decode token header
    try:
        parts = token.split(".")
        info["token_parts"] = len(parts)
        if len(parts) >= 1:
            padding = 4 - len(parts[0]) % 4
            header_b64 = parts[0] + ("=" * padding if padding != 4 else "")
            header = json.loads(base64.urlsafe_b64decode(header_b64))
            info["token_header"] = header
    except Exception as e:
        info["token_header_error"] = str(e)

    # Try HMAC verification
    if len(parts) == 3 and raw_secret:
        try:
            secret_bytes = base64.b64decode(raw_secret)
            info["decoded_secret_length"] = len(secret_bytes)
            signing_input = f"{parts[0]}.{parts[1]}".encode("ascii")
            expected = hmac.new(secret_bytes, signing_input, hashlib.sha256).digest()
            sig_padding = 4 - len(parts[2]) % 4
            actual = base64.urlsafe_b64decode(parts[2] + ("=" * sig_padding if sig_padding != 4 else ""))
            info["signature_match"] = hmac.compare_digest(expected, actual)
            info["expected_sig_b64"] = base64.b64encode(expected).decode()[:20] + "..."
            info["actual_sig_b64"] = base64.b64encode(actual).decode()[:20] + "..."
        except Exception as e:
            info["verification_error"] = str(e)

    return info


# Register Modular Routers
app.include_router(chat_router.router)
app.include_router(mood_router.router)
app.include_router(task_router.router)
app.include_router(garden_router.router)
app.include_router(community_router.router)


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
        intensity = float(f"{random.uniform(0.3, 0.95):.2f}")
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

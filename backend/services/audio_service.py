import os
import uuid
from cartesia import Cartesia
from groq import Groq
import requests
import json

# ── Emotion Mapping ──────────────────────────────────────────────────────────
# Maps GoEmotions labels (from our emotion_service) to Cartesia Sonic 3 emotions.
# Cartesia supports 60+ emotions; we map the most relevant ones for mental health.

EMOTION_MAP = {
    # Positive / Calm
    "joy": "happy",
    "love": "affectionate",
    "admiration": "grateful",
    "amusement": "joking/comedic",
    "approval": "content",
    "caring": "sympathetic",
    "gratitude": "grateful",
    "excitement": "excited",
    "optimism": "enthusiastic",
    "pride": "proud",
    "relief": "peaceful",
    "desire": "anticipation",
    # Negative / Distress
    "sadness": "sad",
    "grief": "melancholic",
    "disappointment": "disappointed",
    "remorse": "guilty",
    "embarrassment": "hesitant",
    "nervousness": "anxious",
    "fear": "scared",
    "anger": "angry",
    "annoyance": "frustrated",
    "disgust": "disgusted",
    "disapproval": "disappointed",
    # Neutral / Ambiguous
    "confusion": "confused",
    "curiosity": "curious",
    "surprise": "surprised",
    "realization": "contemplative",
    "neutral": "neutral",
}

# Speed adjustments based on emotional context (Cartesia expects float: 0.5 - 2.0)
EMOTION_SPEED_MAP = {
    "sad": 0.8,
    "melancholic": 0.75,
    "peaceful": 0.85,
    "calm": 0.85,
    "sympathetic": 0.85,
    "anxious": 1.0,
    "scared": 1.0,
    "excited": 1.15,
    "enthusiastic": 1.1,
    "happy": 1.0,
    "neutral": 1.0,
}

# Languages supported by Cartesia Sonic 3 (42 languages)
SUPPORTED_TTS_LANGUAGES = {
    "en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa",
    "fr", "de", "es", "it", "pt", "nl", "ru", "uk", "pl", "sv",
    "da", "fi", "tr", "el", "cs", "sk", "ro", "bg", "hr",
    "zh", "ja", "ko", "ms", "tl", "ar", "he",
}


# ── Service Class ────────────────────────────────────────────────────────────

class AudioService:
    """Handles STT (via Groq Whisper) and TTS (via Cartesia Sonic 3)."""

    def __init__(self) -> None:
        self._groq_client: Groq | None = None
        self._cartesia_client: Cartesia | None = None

        # Default voice ID (English, warm female voice)
        self.default_voice_id = "dbfa416f-d5c3-4006-854b-235ef6bdf4fd"

    def load_clients(self) -> None:
        """Initialize the API clients from environment variables."""
        groq_api_key = os.environ.get("GROQ_API_KEY")
        cartesia_api_key = os.environ.get("CARTESIA_API_KEY")

        if not groq_api_key:
            print("[AudioService] WARNING: GROQ_API_KEY environment variable not set!")
        else:
            self._groq_client = Groq(api_key=groq_api_key)
            print("[AudioService] [OK] Groq Whisper client initialized.")

        if not cartesia_api_key:
            print("[AudioService] WARNING: CARTESIA_API_KEY environment variable not set!")
        else:
            self._cartesia_client = Cartesia(api_key=cartesia_api_key)
            print("[AudioService] [OK] Cartesia Sonic 3 client initialized.")

    def transcribe_audio(self, file_path: str) -> str:
        """Converts user's spoken audio into text using Groq's Whisper-large-v3 model."""
        if not self._groq_client:
            raise RuntimeError("Groq client not loaded. Cannot transcribe audio.")

        with open(file_path, "rb") as file:
            transcription = self._groq_client.audio.transcriptions.create(
                file=(os.path.basename(file_path), file.read()),
                model="whisper-large-v3",
                response_format="text"
            )
        return transcription

    def generate_speech(self, text: str, output_path: str, detected_emotion: str, language: str = "en") -> str:
        """
        Converts AI's text response into emotion-aware audio using Cartesia Sonic 3.

        Sonic 3 is a unified multilingual model supporting 42 languages with
        built-in emotion controls via generation_config.
        """
        if not self._cartesia_client:
            raise RuntimeError("Cartesia client not loaded. Cannot generate speech.")

        # ── Voice selection by language ──────────────────────────────────
        # Sonic 3 uses a single model ID for all languages.
        # Different voice IDs give native-sounding pronunciation per language.
        VOICE_MAP = {
            "en": "dbfa416f-d5c3-4006-854b-235ef6bdf4fd",  # English warm voice
            "hi": "20e68f5c-08e5-42d0-8e9b-6e716fd1ae66",  # Hindi - Vivek
        }

        voice_id = VOICE_MAP.get(language, VOICE_MAP["en"])

        # ── Validate language (fallback to English for unsupported ones) ─
        tts_language = language if language in SUPPORTED_TTS_LANGUAGES else "en"

        # ── Map detected emotion to Cartesia emotion tag ────────────────
        cartesia_emotion = EMOTION_MAP.get(detected_emotion, "neutral")
        speed = EMOTION_SPEED_MAP.get(cartesia_emotion, 1.0)

        print(f"[TTS] Emotion: {detected_emotion} → Cartesia: {cartesia_emotion}, Speed: {speed}, Lang: {language} → TTS: {tts_language}")

        # ── Sanitize transcript ─────────────────────────────────────────
        if not text or not text.strip():
            text = "I'm here for you. Let's talk about what's on your mind."

        # ── Build Sonic 3 API payload ───────────────────────────────────
        url = "https://api.cartesia.ai/tts/bytes"

        headers = {
            "Content-Type": "application/json",
            "X-API-Key": os.environ.get("CARTESIA_API_KEY", ""),
            "Cartesia-Version": "2024-06-10"
        }

        payload = {
            "model_id": "sonic-3",
            "transcript": text,
            "voice": {
                "mode": "id",
                "id": voice_id
            },
            "output_format": {
                "container": "mp3",
                "encoding": "pcm_f32le",
                "sample_rate": 44100
            },
            "language": tts_language,
            "generation_config": {
                "emotion": cartesia_emotion,
                "speed": speed,
            }
        }

        json_payload = json.dumps(payload, ensure_ascii=False).encode('utf-8')

        try:
            response = requests.post(url, headers=headers, data=json_payload)
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            with open("cartesia_error.log", "w", encoding="utf-8") as err_f:
                err_f.write(f"Status: {e.response.status_code}\n")
                err_f.write(f"Response: {e.response.text}\n")
                err_f.write(f"Payload sent: {str(payload)}\n")
            print(f"[CARTESIA API ERROR]: {e.response.text}")
            raise

        # Save audio
        with open(output_path, "wb") as f:
            f.write(response.content)

        return output_path


# Singleton instance
audio_service = AudioService()

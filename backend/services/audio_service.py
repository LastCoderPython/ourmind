import os
import uuid
import asyncio
from cartesia import Cartesia
from groq import Groq
import requests

# ── Service Class ────────────────────────────────────────────────────────────

class AudioService:
    """Handles STT (via Groq Whisper) and TTS (via Cartesia Sonic)."""

    def __init__(self) -> None:
        self._groq_client: Groq | None = None
        self._cartesia_client: Cartesia | None = None
        
        # Default English voice ID (used as fallback)
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
            print("[AudioService] [OK] Cartesia TTS client initialized.")

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
        Converts AI's text response into highly realistic audio using Cartesia.
        Dynamically selects voice and model based on the detected language.
        """
        if not self._cartesia_client:
            raise RuntimeError("Cartesia client not loaded. Cannot generate speech.")
        
        # Language-to-voice mapping (Cartesia voice IDs)
        # Each voice must be compatible with the model used for that language.
        VOICE_MAP = {
            "en": {"id": "dbfa416f-d5c3-4006-854b-235ef6bdf4fd", "model": "sonic-english"},
            "hi": {"id": "20e68f5c-08e5-42d0-8e9b-6e716fd1ae66", "model": "sonic-multilingual", "tts_lang": "hi"},  # Vivek - Composed Voice
        }
        
        voice_entry = VOICE_MAP.get(language, VOICE_MAP["en"])
        voice_id = voice_entry["id"]
        model_id = voice_entry["model"]
        tts_lang = voice_entry.get("tts_lang", language)
            
        # Generate audio using direct Cartesia HTTP REST endpoint for native MP3 support
        url = "https://api.cartesia.ai/tts/bytes"
        
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": os.environ.get("CARTESIA_API_KEY", ""),
            "Cartesia-Version": "2024-06-10"
        }
        
        # Sanitize: ensure transcript is non-empty for Cartesia
        if not text or not text.strip():
            text = "I'm here for you. Let's talk about what's on your mind."
        
        payload = {
            "model_id": model_id,
            "transcript": text,
            "voice": {
                "mode": "id",
                "id": voice_id
            },
            "output_format": {
                "container": "mp3",
                "encoding": "pcm_f32le",
                "sample_rate": 44100
            }
        }
        
        # Add language parameter only for sonic-multilingual
        if model_id == "sonic-multilingual":
            payload["language"] = tts_lang
        
        # Note: sonic-multilingual does NOT support __experimental_controls for emotion

        import json
        json_payload = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        
        try:
            response = requests.post(url, headers=headers, data=json_payload)
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            # Write the full error to a file for debugging
            with open("cartesia_error.log", "w", encoding="utf-8") as err_f:
                err_f.write(f"Status: {e.response.status_code}\n")
                err_f.write(f"Response: {e.response.text}\n")
                err_f.write(f"Payload sent: {str(payload)}\n")
            print(f"[CARTESIA API ERROR]: {e.response.text}")
            raise
        
        # Save the audio chunk(s) to the output path
        with open(output_path, "wb") as f:
            f.write(response.content)
                
        return output_path

# Singleton instance
audio_service = AudioService()

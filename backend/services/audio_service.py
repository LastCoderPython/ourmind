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
        
        # We mapped specific "Cartesia Sonic" voice IDs.
        # This is a calm, warm, empathetic American female voice ("Raleigh" or similar)
        # We can dynamically change this based on the speaker if desired.
        self.default_voice_id = "a0e99841-438c-4a64-b679-ae501e7d6091" # Example warm voice ID
        # Wait, let's use a known standard Cartesia voice ID:
        # "Kentucky Woman" or "Friendly Reading Man", we will use a generic one 
        # that exists (or replace with any stable cartesia voice ID)
        self.default_voice_id = "a0e99841-438c-4a64-b679-ae501e7d6091" 
        
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

    def generate_speech(self, text: str, output_path: str, detected_emotion: str) -> str:
        """
        Converts AI's text response into highly realistic audio using Cartesia.
        Dynamically adjusts voice tone based on the detected emotion.
        """
        if not self._cartesia_client:
            raise RuntimeError("Cartesia client not loaded. Cannot generate speech.")
            
        # Map our local `emotion_service` dominant_emotion to Cartesia's emotional prompts
        # Cartesia supports emotions like: anger, sadness, happiness, fear, surprise
        emotion_map = {
            "Anxiety": "calm",
            "Sadness": "sadness",  # Or 'calm'
            "Joy": "happiness",
            "Anger": "calm",
            "Neutral": None,
            "Crisis": "sadness" # Empathy for crisis
        }
        
        cartesia_emotion = emotion_map.get(detected_emotion, None)
        
        # Prepare the voice configuration
        # If an emotion is mapped, we pass the emotion tag. Otherwise standard.
        voice_config = {
            "mode": "id",
            "id": "a0e99841-438c-4a64-b679-ae501e7d6091", # Known default voice ID
        }
        
        # Actually Cartesia's raw API takes emotion in experimental controls (based on their latest SDK)
        # We will use the simplest approach provided by the python SDK 
        # (Note: Cartesia API updates format quickly, `experimental_controls={ "emotion": [...] }` is common)
        
        controls = {}
        # Generate audio using direct Cartesia HTTP REST endpoint for native MP3 support
        url = "https://api.cartesia.ai/tts/bytes"
        
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": os.environ.get("CARTESIA_API_KEY", ""),
            "Cartesia-Version": "2024-06-10"
        }
        
        payload = {
            "model_id": "sonic-english",
            "transcript": text,
            "voice": {
                "mode": "id",
                "id": voice_config["id"]
            },
            "output_format": {
                "container": "mp3",
                "encoding": "pcm_f32le",
                "sample_rate": 44100
            }
        }
        
        if cartesia_emotion:
            payload["voice"]["__experimental_controls"] = {
                "emotion": [cartesia_emotion, "highest"]
            }

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        # Save the audio chunk(s) to the output path
        with open(output_path, "wb") as f:
            f.write(response.content)
                
        return output_path

# Singleton instance
audio_service = AudioService()

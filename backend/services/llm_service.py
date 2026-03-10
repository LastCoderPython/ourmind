"""
LLM Conversational Service
===========================
Uses Groq API (Llama 3 8B) for ultra-fast, cloud-based mental health counselling.
"""

import os
import json
from groq import Groq
from collections import defaultdict


# ── Constants ────────────────────────────────────────────────────────────────

MODEL_NAME = "llama-3.1-8b-instant"

SYSTEM_PROMPT = (
    "You are an empathetic, CBT-trained mental health companion for university "
    "students. Use localized analogies relevant to North East India. Maintain "
    "student anonymity and focus on active listening and coping strategies. "
    "Respond with warmth, validate feelings, and guide students through "
    "cognitive behavioral techniques when appropriate. Keep responses concise "
    "and supportive. "
    "LANGUAGE RULE: You MUST reply in ENGLISH by default. "
    "Only switch to another language if the user CLEARLY writes in that language "
    "(e.g., full sentences in Hindi, Bengali, or Assamese). Short English phrases, "
    "greetings, or single words should ALWAYS get an English response. "
    "IMPORTANT: You MUST ALWAYS reply with a valid JSON object strictly containing THREE keys: "
    "1. 'response': Your conversational text response in English (or the user's language if they wrote in a non-English language). "
    "2. 'suggested_tasks': A list of 0 to 2 short, actionable gamified tasks for the user "
    "to complete today (e.g. '5-minute breathing exercise'). "
    "3. 'detected_language': A 2-letter ISO code representing the language spoken by the user (e.g., 'en', 'hi', 'bn', 'as')."
)

MAX_HISTORY_TURNS = 10      # keep last N user+assistant turns per session


# ── Service Class ────────────────────────────────────────────────────────────

class LLMService:
    """Uses Groq cloud API for counselling generation."""

    def __init__(self) -> None:
        self._client: Groq | None = None
        self._history: dict[str, list[dict[str, str]]] = defaultdict(list)

    def load_model(self) -> None:
        """Initialize the Groq client from environment variable."""
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            print("[LLMService] WARNING: GROQ_API_KEY environment variable not set!")
        
        self._client = Groq(api_key=api_key)
        print("[LLMService] [OK] Groq client initialized successfully.")

    def get_response(self, message: str, session_id: str) -> tuple[str, list[str], str]:
        """
        Generate a counselling response, tasks, and detect language using Groq.

        Parameters
        ----------
        message    : The user's message.
        session_id : Unique session identifier for conversation history.

        Returns
        -------
        Tuple containing (The assistant's response string, List of suggested tasks, Detected language code).
        """
        if self._client is None:
            raise RuntimeError("LLM client not loaded. Call load_model() first.")

        # Build conversation history
        history = self._history[session_id]
        history.append({"role": "user", "content": message})

        # Trim history to keep context window manageable
        if len(history) > MAX_HISTORY_TURNS * 2:
            self._history[session_id] = history[-(MAX_HISTORY_TURNS * 2):]  # type: ignore
            history = self._history[session_id]

        # Construct messages array
        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history
        

        try:
            assert self._client is not None
            completion = self._client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
                top_p=0.9,
                response_format={"type": "json_object"},
            )
            
            raw_response = completion.choices[0].message.content.strip()
            
            # Parse the JSON out
            try:
                parsed = json.loads(raw_response)
                if not isinstance(parsed, dict):
                    parsed = {"response": str(parsed)}
                    
                ai_text = parsed.get("response", "I'm here to listen.")
                ai_tasks = parsed.get("suggested_tasks", [])
                detected_language = parsed.get("detected_language", "en")
                if not isinstance(ai_tasks, list):
                    ai_tasks = [str(ai_tasks)] if ai_tasks else []
            except json.JSONDecodeError:
                # Fallback in case the LLM breaks syntax
                ai_text = raw_response
                ai_tasks = []
                detected_language = "en"
            
            # Store assistant response in history
            history.append({"role": "assistant", "content": ai_text})
            return ai_text, ai_tasks, detected_language
            
        except Exception as e:
            # Re-raise to be caught by fastapi endpoint
            raise RuntimeError(f"Groq API error: {str(e)}")

    def clear_session(self, session_id: str) -> None:
        """Clear conversation history for a session."""
        self._history.pop(session_id, None)


# Singleton instance
llm_service = LLMService()

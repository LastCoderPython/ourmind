"""
LLM Conversational Service
===========================
Uses Groq API (Llama 3 8B) for ultra-fast, cloud-based mental health counselling.
"""

import os
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
    "and supportive."
)

MAX_HISTORY_TURNS = 10      # keep last N user+assistant turns per session


# ── Service Class ────────────────────────────────────────────────────────────

class LLMService:
    """Uses Groq cloud API for counselling generation."""

    def __init__(self) -> None:
        self._client = None
        self._history: dict[str, list[dict[str, str]]] = defaultdict(list)

    def load_model(self) -> None:
        """Initialize the Groq client from environment variable."""
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            print("[LLMService] WARNING: GROQ_API_KEY environment variable not set!")
        
        self._client = Groq(api_key=api_key)
        print("[LLMService] [OK] Groq client initialized successfully.")

    def get_response(self, message: str, session_id: str) -> str:
        """
        Generate a counselling response for the given message using Groq.

        Parameters
        ----------
        message    : The user's message.
        session_id : Unique session identifier for conversation history.

        Returns
        -------
        The assistant's response string.
        """
        if self._client is None:
            raise RuntimeError("LLM client not loaded. Call load_model() first.")

        # Build conversation history
        history = self._history[session_id]
        history.append({"role": "user", "content": message})

        # Trim history to keep context window manageable
        if len(history) > MAX_HISTORY_TURNS * 2:
            history[:] = history[-(MAX_HISTORY_TURNS * 2):]

        # Construct messages array
        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history

        try:
            completion = self._client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                temperature=0.7,
                max_tokens=512,
                top_p=0.9,
            )
            
            response = completion.choices[0].message.content.strip()
            
            # Store assistant response in history
            history.append({"role": "assistant", "content": response})
            return response
            
        except Exception as e:
            # Re-raise to be caught by fastapi endpoint
            raise RuntimeError(f"Groq API error: {str(e)}")

    def clear_session(self, session_id: str) -> None:
        """Clear conversation history for a session."""
        self._history.pop(session_id, None)


# Singleton instance
llm_service = LLMService()

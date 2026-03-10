"""
Emotion & Distress Analysis Service
====================================
Dual-model architecture for robust mental health signal detection,
using the HuggingFace Inference API (cloud-based, zero local RAM):

1. SamLowe/roberta-base-go_emotions       → 28 fine-grained emotions
2. lxyuan/distilbert-base-multilingual-cased-sentiments-student
                                           → Multilingual distress sentiment
"""

import os
import requests
from typing import Any


# ── Constants ────────────────────────────────────────────────────────────────

EMOTION_API_URL = "https://router.huggingface.co/hf-inference/models/SamLowe/roberta-base-go_emotions"
DISTRESS_API_URL = "https://router.huggingface.co/hf-inference/models/lxyuan/distilbert-base-multilingual-cased-sentiments-student"

# GoEmotions labels that indicate elevated mental health risk
CRISIS_EMOTION_LABELS = {"grief", "fear", "sadness", "remorse", "nervousness", "disappointment"}
EMOTION_CRISIS_THRESHOLD = 0.7

# Distress sentiment threshold (negative sentiment)
DISTRESS_CRISIS_THRESHOLD = 0.85

HELPLINES = [
    {
        "name": "iCall – Psychosocial Helpline",
        "number": "9152987821",
        "description": "Professional counselling for emotional distress (Mon–Sat, 8am–10pm)",
    },
    {
        "name": "Vandrevala Foundation",
        "number": "1860-2662-345",
        "description": "24/7 mental health support in multiple languages",
    },
    {
        "name": "NIMHANS Helpline",
        "number": "080-46110007",
        "description": "National Institute of Mental Health & Neurosciences helpline",
    },
    {
        "name": "Assam State Mental Health Helpline",
        "number": "104",
        "description": "Government of Assam health & mental health assistance",
    },
    {
        "name": "Snehi – Emotional Support",
        "number": "044-24640050",
        "description": "Emotional support and suicide prevention helpline",
    },
]


# ── Service Class ────────────────────────────────────────────────────────────

class EmotionService:
    """
    Dual-model emotion + distress analysis via HuggingFace Inference API.

    Model 1 (GoEmotions): 28-label fine-grained emotion detection.
    Model 2 (Multilingual Sentiment): positive/negative/neutral distress signal
             that works across English, Hindi, Assamese, Bengali, etc.
    """

    def __init__(self) -> None:
        self._api_token: str | None = None
        self._headers: dict[str, str] = {}

    def load_model(self) -> None:
        """Load HuggingFace API token from environment."""
        self._api_token = os.environ.get("HF_API_TOKEN", "")
        if not self._api_token:
            print("[EmotionService] WARNING: HF_API_TOKEN not set! Emotion analysis will fail.")
        else:
            print("[EmotionService] [OK] HuggingFace Inference API token loaded.")

        self._headers = {"Authorization": f"Bearer {self._api_token}"}

    def _query_hf(self, api_url: str, text: str) -> list[dict[str, Any]]:
        """Send a request to the HuggingFace Inference API and return results."""
        try:
            response = requests.post(
                api_url,
                headers=self._headers,
                json={"inputs": text, "options": {"wait_for_model": True}},
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()

            # HF API returns [[{label, score}, ...]] for text-classification with top_k
            if isinstance(data, list) and len(data) > 0 and isinstance(data[0], list):
                return data[0]
            elif isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
                return data
            else:
                print(f"[EmotionService] Unexpected API response format: {type(data)}")
                return []

        except requests.exceptions.RequestException as e:
            print(f"[EmotionService] HuggingFace API error: {str(e)}")
            return []

    def analyze(self, text: str) -> dict[str, Any]:
        """
        Run dual-model analysis on the input text via HuggingFace Inference API.

        Returns
        -------
        dict with keys:
            emotions         – dict of all 28 GoEmotions label → score
            distress_scores  – dict of sentiment labels → score
            dominant_emotion – str, highest-scoring emotion label
            crisis_trigger   – bool
            crisis_reasons   – list of strings explaining why crisis was triggered
            helplines        – list of helpline dicts (only when crisis)
        """
        truncated = text[:512]

        # ── GoEmotions Analysis ──────────────────────────────────────────
        emotion_results = self._query_hf(EMOTION_API_URL, truncated)
        emotion_scores: dict[str, float] = {
            item["label"]: round(item["score"], 4)
            for item in emotion_results
        } if emotion_results else {"neutral": 1.0}

        dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0]

        # ── Distress Sentiment Analysis ──────────────────────────────────
        distress_results = self._query_hf(DISTRESS_API_URL, truncated)
        distress_scores: dict[str, float] = {
            item["label"]: round(item["score"], 4)
            for item in distress_results
        } if distress_results else {"neutral": 1.0}

        # ── Crisis Detection (dual-signal) ──────────────────────────────
        crisis_reasons: list[str] = []

        # Signal 1: High-risk emotions from GoEmotions
        for label in CRISIS_EMOTION_LABELS:
            score = emotion_scores.get(label, 0.0)
            if score > EMOTION_CRISIS_THRESHOLD:
                crisis_reasons.append(
                    f"High '{label}' detected ({score:.2f} > {EMOTION_CRISIS_THRESHOLD})"
                )

        # Signal 2: Strong negative sentiment from multilingual model
        negative_score = distress_scores.get("negative", 0.0)
        if negative_score > DISTRESS_CRISIS_THRESHOLD:
            crisis_reasons.append(
                f"High distress sentiment ({negative_score:.2f} > {DISTRESS_CRISIS_THRESHOLD})"
            )

        crisis_trigger = len(crisis_reasons) > 0

        # ── Build Output ─────────────────────────────────────────────────
        output: dict[str, Any] = {
            "emotions": emotion_scores,
            "distress_scores": distress_scores,
            "dominant_emotion": dominant_emotion,
            "crisis_trigger": crisis_trigger,
            "crisis_reasons": crisis_reasons,
        }

        if crisis_trigger:
            output["helplines"] = HELPLINES

        return output


# Singleton instance
emotion_service = EmotionService()

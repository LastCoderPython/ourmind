"""
Emotion & Distress Analysis Service
====================================
Dual-model architecture for robust mental health signal detection:

1. SamLowe/roberta-base-go_emotions       → 28 fine-grained emotions (English)
2. lxyuan/distilbert-base-multilingual-cased-sentiments-student
                                           → Multilingual distress sentiment

Both models run on CUDA for real-time inference.
"""

from transformers import pipeline
import torch
from typing import Any


# ── Constants ────────────────────────────────────────────────────────────────

EMOTION_MODEL = "SamLowe/roberta-base-go_emotions"
DISTRESS_MODEL = "lxyuan/distilbert-base-multilingual-cased-sentiments-student"

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
    Dual-model emotion + distress analysis on CUDA.

    Model 1 (GoEmotions): 28-label fine-grained emotion detection.
    Model 2 (Multilingual Sentiment): positive/negative/neutral distress signal
             that works across English, Hindi, Assamese, Bengali, etc.
    """

    def __init__(self) -> None:
        self._emotion_pipeline = None
        self._distress_pipeline = None

    def load_model(self) -> None:
        """Load both analysis pipelines onto CPU to save VRAM for the LLM."""
        device = -1  # Force CPU
        device_label = "cpu"

        # ── Model 1: GoEmotions (28 labels) ──────────────────────────────
        print(f"[EmotionService] Loading {EMOTION_MODEL} on {device_label}...")
        self._emotion_pipeline = pipeline(
            "text-classification",
            model=EMOTION_MODEL,
            top_k=None,
            device=device,
            truncation=True,
        )
        print("[EmotionService] [OK] GoEmotions model loaded.")

        # ── Model 2: Multilingual Distress Sentiment ─────────────────────
        print(f"[EmotionService] Loading {DISTRESS_MODEL} on {device_label}...")
        self._distress_pipeline = pipeline(
            "text-classification",
            model=DISTRESS_MODEL,
            top_k=None,
            device=device,
            truncation=True,
        )
        print("[EmotionService] [OK] Multilingual distress model loaded.")

    def analyze(self, text: str) -> dict[str, Any]:
        """
        Run dual-model analysis on the input text.

        Returns
        -------
        dict with keys:
            emotions         – dict of all 28 GoEmotions label → score
            distress_scores  – dict of sentiment labels → score (positive/negative/neutral)
            dominant_emotion – str, highest-scoring emotion label
            crisis_trigger   – bool
            crisis_reasons   – list of strings explaining why crisis was triggered
            helplines        – list of helpline dicts (only when crisis)
        """
        if self._emotion_pipeline is None or self._distress_pipeline is None:
            raise RuntimeError("Models not loaded. Call load_model() first.")

        truncated = text[:512]

        # ── GoEmotions Analysis ──────────────────────────────────────────
        emotion_results = self._emotion_pipeline(truncated)
        emotion_scores: dict[str, float] = {
            item["label"]: round(item["score"], 4)
            for item in emotion_results[0]
        }

        dominant_emotion = max(emotion_scores, key=emotion_scores.get)

        # ── Distress Sentiment Analysis ──────────────────────────────────
        distress_results = self._distress_pipeline(truncated)
        distress_scores: dict[str, float] = {
            item["label"]: round(item["score"], 4)
            for item in distress_results[0]
        }

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

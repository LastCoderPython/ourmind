# OurMind API Documentation for Frontend

This document explains how the React/Next.js frontend should communicate with the FastAPI backend.

## Base URL
When running locally: `http://127.0.0.1:8000`

---

## 1. Chat & Analysis Endpoint
**POST** `/api/chat`

This is the core endpoint. Whenever the user sends a message, you send it here. The backend will run the text through two local emotion detection models (GoEmotions 28-label and Multilingual Distress), check for crisis triggers, and then generate a therapeutic response using Llama 3 via Groq.

### Request Body (JSON)
```json
{
  "session_id": "user_123_session",
  "message": "I am feeling extremely overwhelmed with my university assignments and can't sleep."
}
```

### Success Response (200 OK)
```json
{
  "session_id": "user_123_session",
  "response": "I hear how overwhelmed you are feeling right now...",
  "emotions": {
    "nervousness": 0.82,
    "sadness": 0.45,
    "fear": 0.31
  },
  "distress_scores": {
    "positive": 0.05,
    "neutral": 0.10,
    "negative": 0.85
  },
  "dominant_emotion": "nervousness",
  "crisis": {
    "crisis_trigger": true,
    "crisis_reasons": [
      "Negative distress score (0.85) exceeds 0.85 threshold.",
      "High level of nervousness (0.82) detected."
    ],
    "helplines": [
      "National Suicide Prevention Lifeline: 988",
      "Crisis Text Line: Text HOME to 741741",
      "University Counseling Center: (555) 123-4567"
    ]
  }
}
```

**Frontend Implementation Notes:**
- Display the `response` string in the chat bubble.
- If `crisis.crisis_trigger` is `true`, the UI should immediately render a high-priority alert or persistent banner displaying the strings inside `crisis.helplines`.
- You can use `dominant_emotion` to dynamically change the UI colors, mascot expressions, or background animations!

---

## 2. Dashboard Analytics Endpoint
**GET** `/api/dashboard/{session_id}`

This endpoint provides mock 14-day historical mood data. The frontend should use this to render the user's progress graphs and mood charts on their profile/dashboard page.

### Path Parameters
- `session_id` (string): The unique ID of the user's session.

### Success Response (200 OK)
```json
{
  "session_id": "user_123_session",
  "history": [
    {
      "date": "2023-10-01",
      "emotion": "anxiety",
      "distress_level": 0.75
    },
    {
      "date": "2023-10-02",
      "emotion": "neutral",
      "distress_level": 0.40
    }
  ]
}
```

**Frontend Implementation Notes:**
- Plot `date` on the X-axis and `distress_level` (0.0 to 1.0) on the Y-axis using a charting library (like Recharts or Chart.js).
- You can color-code the data points based on the `emotion` string.

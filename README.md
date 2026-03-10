# Manas: AI Companion for Student Mental Wellness 

**Manas** is an AI-powered multidimensional mental health companion designed specifically to tackle the unique mental health challenges faced by university students. It integrates multiple complex Machine Learning pipelines into a single, seamless, and blazingly fast full-stack application.

This document serves as an overview for judges to understand the core working mechanism, architecture, and technology stack of Manas.

---

## What Manas Does (Core Working)

Manas is not just a chatbot; it is a proactive, empathetic companion paired with a gamified wellness system. The workflow connects three main systems:

**1. Dual-Model Distress Detection & Crisis Hand-off**
Every time a user types or speaks to Manas, the backend intercepts the message and passes it through two AI models:
- **GoEmotions Model:** Scans for 28 distinct emotional states to understand exactly how the student is feeling (e.g., nervousness, sadness, joy).
- **Multilingual Sentiment Model:** Cross-analyzes the input string for deep distress, depression, or severe anxiety markers.
- *If triggered:* The frontend instantly overlays a Crisis Intervention UI containing actionable, local helplines.

**2. Voice-Native Interaction in Multiple Languages**
Students aren't forced to type. They can hit the microphone and *speak* to the companion in **English, Hindi, or Assamese**. 
- The app transcribes the audio, determines the spoken language, generates a therapeutic Cognitive Behavioral Therapy (CBT) informed response using a Large Language Model (LLM), and synthesizes a hyper-realistic human voice reply back to the user in their native languageâ€”all in real-time.

**3. The Gamified "Mind Garden" & Daily Self-Care**
Instead of just talking, the AI actively prescribes daily CBT coping tasks (e.g., "Take a 5-minute walk", "Drink water"). 
- Completing these tasks, combined with the student's daily emotional weather (Mood Score), dynamically grows a virtual "Mind Garden" (from a seed to a flourishing tree). This provides intrinsic motivation for users to build healthy daily habits over time.

---

## ⭐ Key App Components

- **Conversational AI with Emotion & Distress Detection**: A highly empathetic Llama 3.1 LLM that uses dual HuggingFace models (GoEmotions & Multilingual Sentiment) to seamlessly analyze every text or spoken audio to detect mood and severe distress.
- **Zen Garden**: A gamified visual representation of the user's mental health. The garden physically grows from a seed to a flourishing tree based on daily check-ins and completed CBT tasks.
- **Biofeedback UI**: A dynamic, color-shifting dashboard UI and emotional avatars that adapt in real-time based on the user's detected emotional state (e.g., sunny for joy, stormy for distress).
- **Anonymous Community Wall**: A safe, judgement-free social forum where students can share struggles and victories. It features specialized empathy reactions (🫂 Support, 🌱 Growth, 🤝 Relatable, 🛡️ Strength) instead of traditional likes or comments to foster a supportive environment.
- **Total Anonymity**: The entire platform operates without requiring real names, emails, or personal info. The secure Supabase backend tracks users via anonymous nicknames and mathematically generated UUIDs to ensure absolute privacy.

---

## Technical Architecture 

To achieve this in real-time without latency, the architecture is split into a lightweight Next.js frontend and a hyper-fast Python FastAPI backend.

### The Connection (Stateless & Secure)
- **Supabase JWTs:** The user logs in anonymously on the frontend (using only a nickname). The frontend retrieves a secure JSON Web Token (JWT).
- **Axios & Fetch:** The frontend sends standard JSON payloads (via Axios) for analytics and task completions, and streams binary Audio blobs (via the native Fetch API) for voice interaction. Every single request requires the JWT `Authorization: Bearer <token>` header, ensuring total privacy. The backend is 100% stateless and stores no passwords natively.

---

## » Tech Stack Highlights

We carefully selected technologies that maximize performance natively while keeping compute and latency overhead incredibly low.

### ¨ Frontend (The User Interface)
- **Framework:** Next.js 15 (App Router, React 19)
- **Styling:** Tailwind CSS v4 for a highly responsive, mobile-first design.
- **Multilingual State:** Fully localized into 3 languages (English, Hindi, Assamese) right out of the box using custom Contexts and dot-notation dictionaries.
- **Dynamic Layout Adjustments:** Uses real-time `window.visualViewport` tracking so the chat UI perfectly avoids the mobile virtual keyboardâ€”providing a native-app feel on the web.

### Backend (The AI Engine)
- **Framework:** Python 3.11 with FastAPI (running asynchronous request handlers for max speed).
- **Database:** Supabase (PostgreSQL with Row-Level Security).
- **Large Language Model (LLM):** Meta Llama 3.1 (8B), hosted on **Groq Cloud** for lightning-fast token generation.
- **Speech-to-Text (Ear):** Groq Whisper model (for ultra-fast multilingual audio transcription).
- **Text-to-Speech (Mouth):** Cartesia Sonic API (`sonic-multilingual` & `sonic-english`) for cloning highly empathetic, natural human voices.
- **Distress Detection:** HuggingFace Serverless Inference API running `SamLowe/roberta-base-go_emotions` and `distilbert-base-multilingual-cased-sentiments-student`.

---

## Why It Wins

1. **Accessibility Above All:** It meets students where they are. They can speak to it in Hindi while walking between classes and get a Hindi audio response immediately. 
2. **Deep Empathy + Actionable Help:** It doesn't just listen; it detects severe crises securely and prescribes actionable self-care tasks that tangibly grow a virtual plant on their dashboard.
3. **Optimized Latency:** By utilizing Groq LLMs and Cartesia Sonic, the time between a user speaking and the AI responding audibly is kept functionally identical to a human phone call.

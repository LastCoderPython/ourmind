# Manas (formerly OurMind) Frontend Architecture & Handover Guide

This document provides a comprehensive overview of the frontend architecture, tech stack, and API integration points for the **Manas** application. It is designed to act as a handover document for backend developers to understand how the frontend operates and exactly what API endpoints they need to implement.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **State Management**: React Context API (`AuthContext`, `LanguageContext`, `ThemeContext`)
- **API Client**: Axios

---

## 📁 Project Structure

```text
frontend/
├── app/                  # Next.js App Router root (Pages: chat, dashboard, garden, library, login, stats, wall)
├── components/           # Reusable UI components (Header, BottomNav, Providers)
├── contexts/             # Global layout context providers
│   ├── AuthContext.tsx       # Auth tracking (currently anonymous/Supabase)
│   ├── LanguageContext.tsx   # Custom i18n implementation
│   └── ThemeContext.tsx      # Dynamic background color changing
├── hooks/                # Custom React Hooks
│   └── useVisualViewport.ts  # Mobile keyboard dynamic resize handler
├── i18n/                 # Translation JSON files (en.json, hi.json, as.json)
└── lib/                  # Utilities
    ├── apiClient.ts      # Axios instance, all outgoing API fetch functions
    └── demoData.ts       # Local mock data used when NEXT_PUBLIC_DEMO_MODE=true
```

---

## 🌟 Core Frontend Features & Logic

### 1. Multilingual Support (i18n)
- Operated entirely on the client-side via `LanguageContext.tsx`.
- Supports 3 languages: **English (en)**, **Hindi (hi)**, and **Assamese (as)**.
- Transations are pulled from `i18n/*.json` via a dot-notation hook: `const { t } = useLanguage(); t('dashboard.greeting')`.
- Chosen language is persisted securely in local storage under `manas_lang`.

### 2. Daily Task System & Plant Growth
- **Midnight Reset**: The Dashboard contains a `setInterval` that checks the clock every 60 seconds. When the date rolls over at midnight, the dashboard aggressively wipes the currently loaded tasks from the UI state and attempts to re-fetch `{ url: /api/tasks/today }`.
- **Plant Growth Metric**: 
  - The plant's overall health score is locally computed in the Dashboard (and fed to the Garden wrapper) via a 70/30 task-to-mood weighting formula.
  - Formula: `(0.7 × Task Completion %) + (0.3 × Mood Numeric Score) = Plant Growth Score %`
  - The Mood Numeric Score maps text weather from the backend into a value: (Sunny=100, Cloudy=75, Rainy=50, Foggy=40, Stormy=20).

### 3. Mobile Layout Management
- Next.js default `100vh` causes container squishing on mobile devices when virtual keyboards open (most notably in the Chat UI).
- Solved using `useVisualViewport()` hook, swapping `min-h-screen` classes for a dynamic `window.visualViewport.height` px-based height system explicitly for text entry screens.

---

## 🔌 API Integration & Endpoints (Required from Backend)

All endpoint interactions run through `lib/apiClient.ts`. The Axios interceptor grabs the token returned by `supabase.auth.getSession()` and injects `Authorization: Bearer <token>` into the request headers. 

Currently, setting `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local` intercepts these function calls and responds instantly with data from `lib/demoData.ts`. Turn this environment variable to `false` to attempt real queries against `API_BASE_URL` (default: `http://127.0.0.1:8000`).

Here is the exhaustive list of endpoints the Frontend is issuing:

### Chat Interactions
- **`POST /api/chat`**
  - **Payload:** `{ session_id: string, message: string }`
  - **Returns JSON:** `{ response: string, crisis_trigger: boolean, helplines: array, tasks: string[] }`
- **`POST /api/chat/voice`**
  - Uses `fetch()` explicitly (not Axios), formatted as `Multipart/Form-Data`.
  - **Payload:** `audio_file` (WebM blob), `session_id` (string)
  - **Returns Blob:** An Audio file stream to immediately play.
  - **CRITICAL HEADERS REQUIRED:** Because the response body is raw audio data, the Backend MUST return string parameters as custom URL-encoded response headers:
    - `X-User-Transcript`: (String) What the user said
    - `X-AI-Response`: (String) What the AI responded
    - `X-AI-Language`: (String) Identified language (e.g. 'en', 'hi')
    - `X-AI-Tasks`: (Stringified Array) Any tasks interpreted

### Informational Metrics
- **`GET /api/weather`**
  - Returns JSON: `{ overall: string, temperature: string, description: string }`
- **`GET /api/garden`**
  - Returns JSON: `{ plant_stage: number, health_score: number }`
- **`GET /api/moods/history`**
  - Returns JSON list: `[ { date: 'ISO-String', mood: string } ]`

### Tasks
- **`GET /api/tasks/today`**
  - Returns JSON list: `[ { id: string, description: string, completed: boolean } ]`
- **`POST /api/tasks`**
  - Used when the user manually adds a task via input box.
  - Payload JSON: `{ tasks: string[] }`
- **`POST /api/tasks/complete`**
  - Called seamlessly via React optimistic-UI updates.
  - Payload JSON: `{ task_id: string, completed: boolean }`

### Community Wall
- **`GET /api/posts`**
  - Returns JSON list of all posts.
- **`POST /api/posts`**
  - Payload JSON: `{ content: string, username: string }` (The frontend passes "Anonymous")
- **`POST /api/react`**
  - Payload JSON: `{ post_id: string, reaction_type: string }` (Valid types configured in frontend: `'support'`, `'growth'`, `'relatable'`, `'strength'`)

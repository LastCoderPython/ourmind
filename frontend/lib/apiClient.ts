import axios from 'axios';
import { supabase } from '@/lib/supabase';
import {
    demoWeather, demoGarden, demoMoodHistory, demoTasks, demoPosts,
    getDemoChatResponse, getDemoVoiceChatResponse
} from '@/lib/demoData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

// ── Chat ────────────────────────────────────────────────────────────────────

export async function chat(sessionId: string, message: string) {
    if (DEMO_MODE) return getDemoChatResponse(message);
    const { data } = await api.post('/api/chat', { session_id: sessionId, message });
    return data;
}

// ── Voice Chat ──────────────────────────────────────────────────────────────

export async function chatVoice(sessionId: string, audioBlob: Blob) {
    if (DEMO_MODE) return getDemoVoiceChatResponse();

    // Use fetch directly (not axios) because we need raw response headers + blob body
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || '';

    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'recording.webm');
    formData.append('session_id', sessionId);

    const response = await fetch(`${API_BASE_URL}/api/chat/voice`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Voice chat failed: ${response.status}`);
    }

    // Read headers (URL-encoded)
    const userTranscript = decodeURIComponent(response.headers.get('X-User-Transcript') || '');
    const aiResponseText = decodeURIComponent(response.headers.get('X-AI-Response') || '');
    const detectedLang = response.headers.get('X-AI-Language') || 'en';
    const tasksHeader = response.headers.get('X-AI-Tasks');
    const tasks = tasksHeader ? JSON.parse(decodeURIComponent(tasksHeader)) : [];

    // Read body as audio blob
    const audioBlobResponse = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlobResponse);

    return { userTranscript, aiResponseText, detectedLang, tasks, audioUrl };
}

// ── Weather (Emotional) ─────────────────────────────────────────────────────

export async function getWeather() {
    if (DEMO_MODE) return demoWeather;
    const { data } = await api.get('/api/weather');
    return data;
}

// ── Garden ───────────────────────────────────────────────────────────────────

export async function getGarden() {
    if (DEMO_MODE) return demoGarden;
    const { data } = await api.get('/api/garden');
    return data;
}

// ── Mood History ─────────────────────────────────────────────────────────────

export async function getMoodHistory() {
    if (DEMO_MODE) return demoMoodHistory;
    const { data } = await api.get('/api/moods/history');
    return data;
}

// ── Tasks ────────────────────────────────────────────────────────────────────

export async function getTasksToday() {
    if (DEMO_MODE) return demoTasks;
    const { data } = await api.get('/api/tasks/today');
    return data;
}

export async function createTask(tasks: string[]) {
    if (DEMO_MODE) return { success: true };
    const { data } = await api.post('/api/tasks', { tasks });
    return data;
}

export async function completeTask(taskId: string, completed: boolean) {
    if (DEMO_MODE) return { success: true };
    const { data } = await api.post('/api/tasks/complete', { task_id: taskId, completed });
    return data;
}

// ── Community Posts ──────────────────────────────────────────────────────────

export async function getPosts() {
    if (DEMO_MODE) return demoPosts;
    const { data } = await api.get('/api/posts');
    return data;
}

export async function createPost(content: string, username: string = 'Anonymous') {
    if (DEMO_MODE) return { success: true };
    const { data } = await api.post('/api/posts', { content, username });
    return data;
}

export async function reactToPost(postId: string, reactionType: string) {
    if (DEMO_MODE) return { success: true };
    const { data } = await api.post('/api/react', { post_id: postId, reaction_type: reactionType });
    return data;
}

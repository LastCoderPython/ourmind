/**
 * Demo / mock data for testing all features without a live backend.
 * Enable demo mode by setting NEXT_PUBLIC_DEMO_MODE=true in .env.local
 */

// ── Weather ─────────────────────────────────────────────────────────────────
// Cycles through states so you can see the theme change on refresh
const weatherStates = ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Foggy'];
const currentWeatherIndex = Math.floor(Date.now() / 30000) % weatherStates.length; // changes every 30s

export const demoWeather = {
    overall: weatherStates[currentWeatherIndex],
    temperature: '22°C',
    description: `Your emotional weather is ${weatherStates[currentWeatherIndex]} today.`,
};

// ── Garden ───────────────────────────────────────────────────────────────────
export const demoGarden = {
    plant_stage: 3,
    health_score: 72,
    last_watered: new Date().toISOString(),
};

// ── Mood History ─────────────────────────────────────────────────────────────
export const demoMoodHistory = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const moods = ['great', 'good', 'okay', 'good', 'great', 'okay', 'good'];
    return { date: date.toISOString(), mood: moods[i] };
});

// ── Tasks ────────────────────────────────────────────────────────────────────
export const demoTasks = [
    { id: 'demo-1', title: '10 min morning meditation', completed: true },
    { id: 'demo-2', title: 'Journal 3 things I\'m grateful for', completed: false },
    { id: 'demo-3', title: 'Take a 20 min walk outside', completed: false },
    { id: 'demo-4', title: 'Drink 8 glasses of water', completed: false },
];

// ── Community Posts ──────────────────────────────────────────────────────────
export const demoPosts = [
    {
        id: 'post-1',
        user_id: 'u1',
        username: 'QuietRiver',
        content: 'Finally managed to meditate for 10 minutes today without my mind wandering too far. It\'s a small win, but it feels like progress. 🌿',
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        reactions: [
            { reaction_type: 'support' },
            { reaction_type: 'support' },
            { reaction_type: 'growth' },
        ],
    },
    {
        id: 'post-2',
        user_id: 'u2',
        username: 'MorningStar',
        content: 'Grateful for the support system I have. Reaching out was the hardest part, but it made all the difference. Stay strong everyone! 💪',
        created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
        reactions: [
            { reaction_type: 'relatable' },
            { reaction_type: 'relatable' },
            { reaction_type: 'strength' },
            { reaction_type: 'support' },
            { reaction_type: 'support' },
            { reaction_type: 'growth' },
        ],
    },
    {
        id: 'post-3',
        user_id: 'u3',
        username: 'GentleBreeze',
        content: 'I overcame a challenge by saying "no" to an extra project at work. Protecting my peace is a priority now. 🧘',
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
        reactions: [
            { reaction_type: 'strength' },
            { reaction_type: 'strength' },
            { reaction_type: 'relatable' },
        ],
    },
];

// ── Chat ─────────────────────────────────────────────────────────────────────
const demoResponses = [
    "That's really insightful. It sounds like you're becoming more self-aware, which is a huge step. What made you notice that?",
    "I hear you. It's completely normal to feel that way sometimes. Remember, progress isn't always linear — even small steps count. 🌱",
    "Thank you for sharing that with me. It takes courage to open up. Let's explore that feeling a bit more — when did it start?",
    "That's a wonderful observation! Celebrating small wins like this is so important for building resilience. Keep it up! 🎉",
    "I understand. On days like these, sometimes the best thing we can do is just be gentle with ourselves. What's one small kind thing you could do for yourself right now?",
];

let responseIndex = 0;

export function getDemoChatResponse(message: string) {
    const response = demoResponses[responseIndex % demoResponses.length];
    responseIndex++;

    return {
        response: "I'm hearing a lot of pain in what you're saying right now. Please know there is help available.",
        crisis: {
            crisis_trigger: true,
            helplines: [
                { name: 'iCall – Psychosocial Helpline', number: '9152987821', description: 'Available Monday to Saturday' },
                { name: 'Vandrevala Foundation', number: '1860-2662-345', description: '24/7 Support' },
                { name: 'NIMHANS Helpline', number: '080-46110007', description: '24/7 Support' }
            ]
        },
        session_id: 'demo-session',
    };
}

// ── Voice Chat (simulated) ──────────────────────────────────────────────────
export function getDemoVoiceChatResponse() {
    return {
        userTranscript: 'This is a demo voice transcript — no real audio was processed.',
        aiResponseText: 'In demo mode, voice responses are simulated. Connect the backend to hear real AI voice responses! 🎙️',
        detectedLang: 'en',
        tasks: [],
        audioUrl: '', // No audio file in demo mode
    };
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useBiofeedback } from "@/components/BiofeedbackProvider";
import { useUser } from "@/components/UserContext";
import { t } from "@/lib/i18n";

interface Message {
    id: number;
    role: "ai" | "user";
    text: string;
}

const aiResponses = [
    "That's really brave of you to share. Let's explore that feeling together. Can you tell me more about what triggered it?",
    "I hear you. Remember, it's completely okay to feel this way. Let's try a grounding exercise — can you name 5 things you can see right now? 🌱",
    "Thank you for opening up. Your feelings are valid. Would you like to try a quick breathing exercise, or would you prefer to keep talking?",
    "That sounds challenging. Let's reframe this thought together — what would you say to a friend going through the same thing? 💚",
    "I'm glad you're here. Progress isn't always linear, and every check-in counts. What's one small thing that brought you comfort today?",
    "It takes strength to reach out. Let's work through this step by step. What coping strategy has helped you in the past? 🤝",
];

// Extended crisis keywords across languages
const crisisKeywords = [
    // English
    "suicide", "kill myself", "end it all", "don't want to live", "self harm",
    "self-harm", "want to die", "no reason to live", "ending my life", "hurt myself",
    "give up on life", "can't go on", "better off dead", "no hope", "cut myself",
    "overdose", "jump off", "hang myself", "not worth living",
    // Hindi
    "आत्महत्या", "मरना चाहता", "मरना चाहती", "जीना नहीं चाहता", "खुद को मारना",
    // Assamese
    "आत्महत्या", "মৰিব বিচাৰো", "জীয়াই থাকিব নিবিচাৰো",
];

export default function ChatPage() {
    const { language, nickname } = useUser();
    const { setMood } = useBiofeedback();

    const [messages, setMessages] = useState<Message[]>([
        { id: 1, role: "ai", text: t("chat.welcome", language) },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showCrisis, setShowCrisis] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const msgId = useRef(2);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const detectCrisis = (text: string) => {
        const lower = text.toLowerCase();
        return crisisKeywords.some((kw) => lower.includes(kw.toLowerCase()));
    };

    const detectMood = (text: string) => {
        const lower = text.toLowerCase();
        if (/happy|great|amazing|wonderful|fantastic|joyful|excited|खुश|আনন্দিত/.test(lower)) return "joyful" as const;
        if (/good|fine|okay|nice|better|hopeful|अच्छा|ভাল/.test(lower)) return "happy" as const;
        if (/sad|down|upset|crying|unhappy|lonely|दुखी|দুখী/.test(lower)) return "sad" as const;
        if (/depressed|hopeless|worthless|empty|numb|निराश|হতাশ/.test(lower)) return "depressed" as const;
        return "neutral" as const;
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: msgId.current++,
            role: "user",
            text: input.trim(),
        };

        setMessages((prev) => [...prev, userMsg]);

        if (detectCrisis(input)) {
            setShowCrisis(true);
            setInput("");
            return;
        }

        const detectedMood = detectMood(input);
        setMood(detectedMood);

        setInput("");
        setIsTyping(true);

        setTimeout(() => {
            const aiText = aiResponses[Math.floor(Math.random() * aiResponses.length)];
            const aiMsg: Message = {
                id: msgId.current++,
                role: "ai",
                text: aiText,
            };
            setMessages((prev) => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1200 + Math.random() * 800);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-container">
            {/* Crisis Modal */}
            {showCrisis && (
                <div className="crisis-overlay">
                    <h2 className="crisis-title">{t("crisis.title", language)}</h2>
                    <p className="crisis-text">{t("crisis.text", language)}</p>
                    <div className="crisis-helpline">
                        <div className="crisis-helpline-name">iCall (India)</div>
                        <a href="tel:9152987821" className="crisis-helpline-number">9152987821</a>
                    </div>
                    <div className="crisis-helpline">
                        <div className="crisis-helpline-name">Vandrevala Foundation</div>
                        <a href="tel:18602662345" className="crisis-helpline-number">1860-2662-345</a>
                    </div>
                    <div className="crisis-helpline">
                        <div className="crisis-helpline-name">AASRA</div>
                        <a href="tel:9820466726" className="crisis-helpline-number">9820466726</a>
                    </div>
                    <button
                        className="crisis-dismiss"
                        onClick={() => setShowCrisis(false)}
                    >
                        {t("crisis.dismiss", language)}
                    </button>
                </div>
            )}

            {/* Messages */}
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={msg.role === "ai" ? "ai-bubble" : "user-bubble"}
                    >
                        {msg.text}
                    </div>
                ))}

                {isTyping && (
                    <div className="typing-indicator">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="message-input-bar">
                <input
                    className="message-input"
                    type="text"
                    placeholder={t("chat.placeholder", language)}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="Type your message"
                    id="chat-input"
                />
                <button
                    className="send-btn"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    aria-label={t("chat.send", language)}
                    id="send-button"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}

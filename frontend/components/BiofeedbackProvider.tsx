"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

type MoodKey = "joyful" | "happy" | "neutral" | "sad" | "depressed";

interface BiofeedbackContextType {
    mood: MoodKey;
    setMood: (mood: MoodKey) => void;
    toasts: ToastItem[];
    addToast: (message: string) => void;
}

interface ToastItem {
    id: number;
    message: string;
    exiting?: boolean;
}

const BiofeedbackContext = createContext<BiofeedbackContextType>({
    mood: "neutral",
    setMood: () => { },
    toasts: [],
    addToast: () => { },
});

export const useBiofeedback = () => useContext(BiofeedbackContext);

let toastIdCounter = 0;

export function BiofeedbackProvider({ children }: { children: ReactNode }) {
    const [mood, setMood] = useState<MoodKey>("neutral");
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = useCallback((message: string) => {
        const id = ++toastIdCounter;
        setToasts((prev) => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts((prev) =>
                prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
            );
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 300);
        }, 3000);
    }, []);

    return (
        <BiofeedbackContext.Provider value={{ mood, setMood, toasts, addToast }}>
            {children}
        </BiofeedbackContext.Provider>
    );
}

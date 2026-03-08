"use client";

import React from "react";
import { useBiofeedback } from "./BiofeedbackProvider";

export function ToastManager() {
    const { toasts } = useBiofeedback();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast${toast.exiting ? " exit" : ""}`}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
}

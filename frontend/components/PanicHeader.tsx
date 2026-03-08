"use client";

import React from "react";
import { useUser } from "@/components/UserContext";
import { t } from "@/lib/i18n";
import { X } from "lucide-react";

export function PanicHeader() {
    const { nickname, avatarGradient, avatarInitials, language, setLanguage, logout } = useUser();

    const handlePanic = () => {
        if (typeof window !== "undefined") {
            sessionStorage.clear();
            window.location.replace("https://www.google.com");
        }
    };

    return (
        <header className="panic-header">
            <div className="profile-section">
                <div
                    className="geometric-avatar"
                    style={{ background: avatarGradient || undefined }}
                    aria-label="User avatar"
                >
                    {avatarInitials || "OM"}
                </div>
                <span className="profile-name">{nickname || "OurMind"}</span>
            </div>

            <div className="header-actions">
                <div className="language-pill">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as "en" | "hi" | "as")}
                        aria-label="Select language"
                    >
                        <option value="en">EN</option>
                        <option value="as">অসমীয়া</option>
                        <option value="hi">हिंदी</option>
                    </select>
                </div>

                <button
                    className="panic-button"
                    onClick={handlePanic}
                    aria-label={t("header.quickExit", language)}
                    title={t("header.quickExit", language)}
                >
                    <X size={16} strokeWidth={3} />
                </button>
            </div>
        </header>
    );
}

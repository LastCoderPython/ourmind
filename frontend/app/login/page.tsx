"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/UserContext";
import { t } from "@/lib/i18n";
import { Eye, EyeOff, Ghost } from "lucide-react";

export default function LoginPage() {
    const [nickname, setNickname] = useState("");
    const [pin, setPin] = useState("");
    const [ghostMode, setGhostMode] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, language } = useUser();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!nickname.trim() || nickname.trim().length < 3) {
            setError("Nickname must be at least 3 characters");
            return;
        }
        if (!pin.trim() || pin.trim().length < 4) {
            setError("PIN must be at least 4 characters");
            return;
        }

        setIsSubmitting(true);

        // Small delay for visual feedback
        setTimeout(() => {
            const success = login(nickname.trim(), pin.trim(), ghostMode);
            if (success) {
                router.push("/chat");
            } else {
                setError("Incorrect PIN for this nickname. Try again.");
                setIsSubmitting(false);
            }
        }, 400);
    };

    return (
        <div className="login-page">
            {/* Floating blobs */}
            <div className="login-blob login-blob-1" />
            <div className="login-blob login-blob-2" />
            <div className="login-blob login-blob-3" />

            <div className="login-card">
                {/* Logo */}
                <div className="login-logo">
                    <span className="login-logo-icon">🌿</span>
                </div>

                <h1 className="login-title">{t("login.title", language)}</h1>
                <p className="login-subtitle">{t("login.subtitle", language)}</p>

                <form onSubmit={handleSubmit} className="login-form">
                    {/* Nickname */}
                    <div className="login-field">
                        <label className="login-label" htmlFor="login-nickname">
                            {t("login.nickname", language)}
                        </label>
                        <input
                            id="login-nickname"
                            type="text"
                            className="login-input"
                            placeholder="e.g. QuietRiver"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            autoComplete="off"
                            maxLength={20}
                        />
                    </div>

                    {/* PIN */}
                    <div className="login-field">
                        <label className="login-label" htmlFor="login-pin">
                            {t("login.pin", language)}
                        </label>
                        <div className="login-pin-wrapper">
                            <input
                                id="login-pin"
                                type={showPin ? "text" : "password"}
                                className="login-input"
                                placeholder="••••"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                autoComplete="off"
                                maxLength={16}
                            />
                            <button
                                type="button"
                                className="login-pin-toggle"
                                onClick={() => setShowPin(!showPin)}
                                aria-label={showPin ? "Hide PIN" : "Show PIN"}
                            >
                                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Ghost Mode Toggle */}
                    <div className="login-ghost-row">
                        <div className="login-ghost-info">
                            <Ghost size={18} style={{ color: "#9B88ED", flexShrink: 0 }} />
                            <div>
                                <div className="login-ghost-label">{t("login.ghostMode", language)}</div>
                                <div className="login-ghost-desc">{t("login.ghostDesc", language)}</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={`login-toggle${ghostMode ? " active" : ""}`}
                            onClick={() => setGhostMode(!ghostMode)}
                            aria-pressed={ghostMode}
                            aria-label="Toggle Ghost Mode"
                            id="ghost-mode-toggle"
                        >
                            <span className="login-toggle-thumb" />
                        </button>
                    </div>

                    {/* Error */}
                    {error && <div className="login-error">{error}</div>}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn-pill btn-pill-primary login-submit"
                        disabled={isSubmitting}
                        id="login-submit"
                    >
                        {isSubmitting ? "…" : t("login.enter", language)}
                    </button>

                    <p className="login-footer">{t("login.newUser", language)}</p>
                </form>
            </div>
        </div>
    );
}

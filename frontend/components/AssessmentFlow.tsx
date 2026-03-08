"use client";

import React, { useState } from "react";
import { useUser } from "@/components/UserContext";
import { t } from "@/lib/i18n";

interface AssessmentFlowProps {
    onSubmit: (scores: { mood: number; sleep: number; stress: number }) => void;
}

export function AssessmentFlow({ onSubmit }: AssessmentFlowProps) {
    const [mood, setMood] = useState(5);
    const [sleep, setSleep] = useState(5);
    const [stress, setStress] = useState(5);
    const { language } = useUser();

    const getSliderEmoji = (value: number) => {
        if (value <= 2) return "😔";
        if (value <= 4) return "😐";
        if (value <= 6) return "🙂";
        if (value <= 8) return "😊";
        return "🌟";
    };

    const getSliderColor = (value: number) => {
        if (value <= 3) return "#9B88ED";
        if (value <= 5) return "#A67B5B";
        if (value <= 7) return "#F2C94C";
        return "#90B47A";
    };

    const handleSubmit = () => {
        onSubmit({ mood, sleep, stress });
        // Mark today as assessed
        sessionStorage.setItem(
            "ourmind_assessed",
            new Date().toISOString().split("T")[0]
        );
    };

    return (
        <div className="assessment-overlay">
            <div className="assessment-card">
                <div className="assessment-emoji">{getSliderEmoji(mood)}</div>
                <h2 className="assessment-title">{t("assess.title", language)}</h2>
                <p className="assessment-subtitle">{t("assess.subtitle", language)}</p>

                <div className="assessment-sliders">
                    {/* Mood */}
                    <div className="assessment-slider-group">
                        <div className="assessment-slider-header">
                            <span className="assessment-slider-label">{t("assess.mood", language)}</span>
                            <span className="assessment-slider-value" style={{ color: getSliderColor(mood) }}>
                                {mood}/10
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={mood}
                            onChange={(e) => setMood(Number(e.target.value))}
                            className="assessment-range"
                            style={{ "--slider-color": getSliderColor(mood) } as React.CSSProperties}
                            id="slider-mood"
                        />
                    </div>

                    {/* Sleep */}
                    <div className="assessment-slider-group">
                        <div className="assessment-slider-header">
                            <span className="assessment-slider-label">{t("assess.sleep", language)}</span>
                            <span className="assessment-slider-value" style={{ color: getSliderColor(sleep) }}>
                                {sleep}/10
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={sleep}
                            onChange={(e) => setSleep(Number(e.target.value))}
                            className="assessment-range"
                            style={{ "--slider-color": getSliderColor(sleep) } as React.CSSProperties}
                            id="slider-sleep"
                        />
                    </div>

                    {/* Stress */}
                    <div className="assessment-slider-group">
                        <div className="assessment-slider-header">
                            <span className="assessment-slider-label">{t("assess.stress", language)}</span>
                            <span className="assessment-slider-value" style={{ color: getSliderColor(stress) }}>
                                {stress}/10
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={stress}
                            onChange={(e) => setStress(Number(e.target.value))}
                            className="assessment-range"
                            style={{ "--slider-color": getSliderColor(stress) } as React.CSSProperties}
                            id="slider-stress"
                        />
                    </div>
                </div>

                <button
                    className="btn-pill btn-pill-primary assessment-submit"
                    onClick={handleSubmit}
                    id="assessment-submit"
                >
                    {t("assess.submit", language)}
                </button>
            </div>
        </div>
    );
}

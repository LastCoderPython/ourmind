"use client";

import React, { useState, useEffect } from "react";
import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { Flame, TrendingUp } from "lucide-react";
import { useUser } from "@/components/UserContext";
import { t } from "@/lib/i18n";
import { AssessmentFlow } from "@/components/AssessmentFlow";

interface TrendPoint {
    day: string;
    score: number;
}

const initialTrendData: TrendPoint[] = [
    { day: "Mon", score: 5 },
    { day: "Tue", score: 6 },
    { day: "Wed", score: 4 },
    { day: "Thu", score: 7 },
    { day: "Fri", score: 6 },
    { day: "Sat", score: 8 },
];

const moodLabels: Record<number, string> = {
    1: "Very Low",
    2: "Low",
    3: "Struggling",
    4: "Below Average",
    5: "Neutral",
    6: "Okay",
    7: "Good",
    8: "Great",
    9: "Excellent",
    10: "Thriving",
};

function getMoodEmoji(score: number): string {
    if (score <= 2) return "😔";
    if (score <= 4) return "😐";
    if (score <= 6) return "🙂";
    if (score <= 8) return "😊";
    return "🌟";
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "16px",
                    padding: "10px 16px",
                    boxShadow: "0 4px 16px rgba(74,53,37,0.1)",
                    border: "1px solid rgba(74,53,37,0.08)",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#4A3525",
                }}
            >
                <div>{label}</div>
                <div style={{ color: "#90B47A", fontSize: "16px", fontWeight: 800 }}>
                    {payload[0].value}/10
                </div>
            </div>
        );
    }
    return null;
};

export default function StatsPage() {
    const { language } = useUser();
    const [showAssessment, setShowAssessment] = useState(false);
    const [currentScore, setCurrentScore] = useState(7);
    const [streakDays, setStreakDays] = useState(12);
    const [trendData, setTrendData] = useState<TrendPoint[]>(initialTrendData);

    // Check if user has already assessed today
    useEffect(() => {
        const assessedDate = sessionStorage.getItem("ourmind_assessed");
        const today = new Date().toISOString().split("T")[0];
        if (assessedDate !== today) {
            // Small delay so the page renders first
            const timer = setTimeout(() => setShowAssessment(true), 600);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAssessmentSubmit = (scores: { mood: number; sleep: number; stress: number }) => {
        const avg = Math.round((scores.mood + scores.sleep + (11 - scores.stress)) / 3);
        setCurrentScore(avg);

        // Add today's data point to the trend
        const today = dayNames[new Date().getDay()];
        setTrendData((prev) => [...prev, { day: today, score: avg }]);

        // Increment streak
        setStreakDays((prev) => prev + 1);

        setShowAssessment(false);
    };

    return (
        <div className="page-content">
            {showAssessment && (
                <AssessmentFlow onSubmit={handleAssessmentSubmit} />
            )}

            <h1 className="page-title">{t("stats.title", language)}</h1>
            <p className="page-subtitle">{t("stats.subtitle", language)}</p>

            {/* Mood Score Card */}
            <div className="score-card section-gap" id="mood-score-card">
                <div className="score-label">{t("stats.moodScore", language)}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <div className="score-value">{currentScore}</div>
                    <span style={{ fontSize: "20px", opacity: 0.7 }}>/10</span>
                </div>
                <div className="score-subtitle">
                    {getMoodEmoji(currentScore)} {moodLabels[currentScore]}
                </div>
            </div>

            {/* Streak Counter */}
            <div className="streak-card section-gap" id="streak-counter">
                <div className="streak-icon">
                    <Flame size={24} />
                </div>
                <div>
                    <div className="streak-count">{streakDays} days</div>
                    <div className="streak-label">{t("stats.streak", language)}</div>
                </div>
            </div>

            {/* Trend Graph */}
            <div className="chart-card" id="trend-graph">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <TrendingUp size={18} style={{ color: "#90B47A" }} />
                    <span className="chart-title" style={{ margin: 0 }}>
                        {t("stats.weeklyTrend", language)}
                    </span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#90B47A" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#90B47A" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#A89585", fontSize: 12, fontWeight: 600 }}
                        />
                        <YAxis
                            domain={[0, 10]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#A89585", fontSize: 11 }}
                            width={24}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#90B47A"
                            strokeWidth={3}
                            fill="url(#moodGradient)"
                            dot={{ fill: "#90B47A", strokeWidth: 2, stroke: "#fff", r: 5 }}
                            activeDot={{ r: 7, fill: "#90B47A", stroke: "#fff", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

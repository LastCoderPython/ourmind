"use client";

import React, { useState } from "react";
import { useUser } from "@/components/UserContext";
import { t } from "@/lib/i18n";

interface Strategy {
    id: number;
    name: string;
    desc: string;
    icon: string;
    tag: string;
    tagColor: string;
    tagBg: string;
    bgColor: string;
}

const strategies: Strategy[] = [
    {
        id: 1,
        name: "4-7-8 Breathing",
        desc: "Calm your nervous system with this timed breathing pattern.",
        icon: "🌬️",
        tag: "Breathing",
        tagColor: "#90B47A",
        tagBg: "rgba(144, 180, 122, 0.15)",
        bgColor: "rgba(144, 180, 122, 0.10)",
    },
    {
        id: 2,
        name: "Journaling Prompts",
        desc: "Express your thoughts freely with guided writing exercises.",
        icon: "📝",
        tag: "Writing",
        tagColor: "#9B88ED",
        tagBg: "rgba(155, 136, 237, 0.15)",
        bgColor: "rgba(155, 136, 237, 0.10)",
    },
    {
        id: 3,
        name: "Grounding 5-4-3-2-1",
        desc: "Reconnect with the present using your five senses.",
        icon: "🌿",
        tag: "Mindfulness",
        tagColor: "#A67B5B",
        tagBg: "rgba(166, 123, 91, 0.15)",
        bgColor: "rgba(166, 123, 91, 0.10)",
    },
    {
        id: 4,
        name: "Progressive Relaxation",
        desc: "Release physical tension from head to toe methodically.",
        icon: "🧘",
        tag: "Body",
        tagColor: "#F2994A",
        tagBg: "rgba(242, 153, 74, 0.15)",
        bgColor: "rgba(242, 153, 74, 0.10)",
    },
    {
        id: 5,
        name: "Thought Reframing",
        desc: "Challenge negative thoughts using CBT cognitive restructuring.",
        icon: "💡",
        tag: "CBT",
        tagColor: "#F2C94C",
        tagBg: "rgba(242, 201, 76, 0.15)",
        bgColor: "rgba(242, 201, 76, 0.10)",
    },
    {
        id: 6,
        name: "Gratitude Practice",
        desc: "Shift focus to positivity by noting three good things daily.",
        icon: "🌻",
        tag: "Positivity",
        tagColor: "#90B47A",
        tagBg: "rgba(144, 180, 122, 0.15)",
        bgColor: "rgba(144, 180, 122, 0.10)",
    },
    {
        id: 7,
        name: "Safe Space Visualization",
        desc: "Imagine a calm, secure place whenever you feel overwhelmed.",
        icon: "🏡",
        tag: "Imagery",
        tagColor: "#9B88ED",
        tagBg: "rgba(155, 136, 237, 0.15)",
        bgColor: "rgba(155, 136, 237, 0.10)",
    },
    {
        id: 8,
        name: "Self-Compassion Letter",
        desc: "Write yourself a letter with the kindness you'd give a friend.",
        icon: "💌",
        tag: "Self-Care",
        tagColor: "#F2994A",
        tagBg: "rgba(242, 153, 74, 0.15)",
        bgColor: "rgba(242, 153, 74, 0.10)",
    },
];

export default function LibraryPage() {
    const { language } = useUser();
    const [activeCard, setActiveCard] = useState<number | null>(null);

    return (
        <div className="page-content">
            <h1 className="page-title">{t("library.title", language)}</h1>
            <p className="page-subtitle">{t("library.subtitle", language)}</p>

            <div className="resource-grid">
                {strategies.map((s) => (
                    <div
                        key={s.id}
                        className="strategy-card"
                        onClick={() => setActiveCard(activeCard === s.id ? null : s.id)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={activeCard === s.id}
                        id={`strategy-${s.id}`}
                    >
                        <div
                            className="strategy-icon"
                            style={{ background: s.bgColor }}
                        >
                            {s.icon}
                        </div>
                        <span className="strategy-name">{s.name}</span>
                        <span className="strategy-desc">{s.desc}</span>
                        <span
                            className="strategy-tag"
                            style={{ color: s.tagColor, background: s.tagBg }}
                        >
                            {s.tag}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

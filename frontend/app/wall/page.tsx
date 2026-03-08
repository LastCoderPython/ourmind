"use client";

import React, { useState, useRef } from "react";
import { useBiofeedback } from "@/components/BiofeedbackProvider";
import { useUser } from "@/components/UserContext";
import { t } from "@/lib/i18n";
import { getAvatarForNickname } from "@/lib/avatarUtils";

interface WallPost {
    id: number;
    nickname: string;
    avatarGradient: string;
    text: string;
    time: string;
    reactions: {
        support: number;
        growth: number;
        relate: number;
        strength: number;
    };
    myReaction: string | null;
}

const sentenceStarters = [
    "Today I'm grateful for…",
    "I overcame a challenge by…",
    "Something that helped me is…",
    "I want others to know that…",
    "A small win I had today…",
];

const initialPosts: WallPost[] = [
    {
        id: 1,
        nickname: "QuietRiver",
        avatarGradient: getAvatarForNickname("QuietRiver").gradient,
        text: "Today I'm grateful for my friend who stayed with me during a tough time. Small acts of kindness really do make a difference. 💚",
        time: "2 hours ago",
        reactions: { support: 12, growth: 5, relate: 8, strength: 3 },
        myReaction: null,
    },
    {
        id: 2,
        nickname: "MorningDew",
        avatarGradient: getAvatarForNickname("MorningDew").gradient,
        text: "I overcame a challenge by breaking it down into smaller steps. It felt impossible at first, but step-by-step I got through it.",
        time: "4 hours ago",
        reactions: { support: 7, growth: 14, relate: 6, strength: 9 },
        myReaction: null,
    },
    {
        id: 3,
        nickname: "GentleBreeze",
        avatarGradient: getAvatarForNickname("GentleBreeze").gradient,
        text: "Something that helped me is the 4-7-8 breathing technique. I tried it during my exam anxiety and it genuinely calmed me down. 🌬️",
        time: "6 hours ago",
        reactions: { support: 4, growth: 8, relate: 15, strength: 2 },
        myReaction: null,
    },
    {
        id: 4,
        nickname: "SilentMoon",
        avatarGradient: getAvatarForNickname("SilentMoon").gradient,
        text: "A small win I had today — I went for a walk alone and actually enjoyed the silence. Progress is not always loud. 🌙",
        time: "8 hours ago",
        reactions: { support: 9, growth: 11, relate: 7, strength: 6 },
        myReaction: null,
    },
];

export default function WallPage() {
    const [posts, setPosts] = useState<WallPost[]>(initialPosts);
    const [selectedStarter, setSelectedStarter] = useState<string | null>(null);
    const [newPostText, setNewPostText] = useState("");
    const { addToast } = useBiofeedback();
    const { nickname, avatarGradient, language } = useUser();
    const pulsingRef = useRef<Record<string, boolean>>({});

    const reactionConfig = [
        { key: "support", emoji: "🫂", labelKey: "wall.support" },
        { key: "growth", emoji: "🌱", labelKey: "wall.growth" },
        { key: "relate", emoji: "🤝", labelKey: "wall.relate" },
        { key: "strength", emoji: "🛡️", labelKey: "wall.strength" },
    ];

    const handleStarterClick = (starter: string) => {
        if (selectedStarter === starter) {
            setSelectedStarter(null);
            setNewPostText("");
        } else {
            setSelectedStarter(starter);
            setNewPostText(starter + " ");
        }
    };

    const handlePost = () => {
        if (!newPostText.trim() || newPostText.trim().length < 10) return;
        const newPost: WallPost = {
            id: Date.now(),
            nickname: nickname || "Anonymous",
            avatarGradient: avatarGradient || getAvatarForNickname("Anonymous").gradient,
            text: newPostText.trim(),
            time: t("wall.justNow", language),
            reactions: { support: 0, growth: 0, relate: 0, strength: 0 },
            myReaction: null,
        };
        setPosts([newPost, ...posts]);
        setNewPostText("");
        setSelectedStarter(null);
        addToast(`✨ ${t("wall.posted", language)}`);
    };

    const handleReaction = (postId: number, reactionKey: string) => {
        // Trigger pulse animation
        const pulseKey = `${postId}-${reactionKey}`;
        pulsingRef.current[pulseKey] = true;
        setTimeout(() => {
            pulsingRef.current[pulseKey] = false;
        }, 400);

        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) return post;
                const alreadyReacted = post.myReaction === reactionKey;
                const newReactions = { ...post.reactions };

                // Remove previous reaction
                if (post.myReaction) {
                    newReactions[post.myReaction as keyof typeof newReactions] = Math.max(
                        0,
                        newReactions[post.myReaction as keyof typeof newReactions] - 1
                    );
                }

                // Add new reaction if different
                if (!alreadyReacted) {
                    newReactions[reactionKey as keyof typeof newReactions] += 1;
                    const reactionMeta = reactionConfig.find((r) => r.key === reactionKey);
                    if (reactionMeta) {
                        // Toast: "[User] sent [Reaction] to [Author]!"
                        addToast(
                            `${reactionMeta.emoji} ${nickname || "Someone"} sent ${t(reactionMeta.labelKey, language)} to ${post.nickname}!`
                        );
                    }
                }

                return {
                    ...post,
                    reactions: newReactions,
                    myReaction: alreadyReacted ? null : reactionKey,
                };
            })
        );
    };

    return (
        <div className="page-content">
            <h1 className="page-title">{t("wall.title", language)}</h1>
            <p className="page-subtitle">{t("wall.subtitle", language)}</p>

            {/* Post Creator */}
            <div className="wall-creator" id="wall-post-creator">
                <div className="wall-creator-title">{t("wall.shareStory", language)}</div>
                <div className="sentence-starters">
                    {sentenceStarters.map((starter) => (
                        <button
                            key={starter}
                            className={`starter-tag${selectedStarter === starter ? " active" : ""}`}
                            onClick={() => handleStarterClick(starter)}
                        >
                            {starter}
                        </button>
                    ))}
                </div>
                <textarea
                    className="wall-textarea"
                    placeholder={t("wall.placeholder", language)}
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    aria-label="Write a post"
                    id="wall-textarea"
                />
                <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                    <button
                        className="btn-pill btn-pill-primary"
                        onClick={handlePost}
                        disabled={!newPostText.trim() || newPostText.trim().length < 10}
                        id="wall-post-btn"
                    >
                        {t("wall.post", language)}
                    </button>
                </div>
            </div>

            {/* Resilience Feed */}
            <div id="resilience-feed">
                {posts.map((post) => (
                    <div key={post.id} className="wall-post">
                        <div className="wall-post-header">
                            <div
                                className="wall-post-avatar"
                                style={{ background: post.avatarGradient }}
                            >
                                {post.nickname.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="wall-post-name">{post.nickname}</span>
                            <span className="wall-post-time">{post.time}</span>
                        </div>
                        <p className="wall-post-text">{post.text}</p>
                        <div className="reaction-pills">
                            {reactionConfig.map((r) => {
                                const isReacted = post.myReaction === r.key;
                                return (
                                    <button
                                        key={r.key}
                                        className={`reaction-pill${isReacted ? " reacted" : ""}${pulsingRef.current[`${post.id}-${r.key}`] ? " pulse" : ""}`}
                                        onClick={() => handleReaction(post.id, r.key)}
                                        aria-label={`React ${t(r.labelKey, language)}`}
                                    >
                                        <span>{r.emoji}</span>
                                        <span>{t(r.labelKey, language)}</span>
                                        <span className="reaction-count">
                                            {post.reactions[r.key as keyof typeof post.reactions]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

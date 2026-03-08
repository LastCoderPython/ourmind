"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { Locale } from "@/lib/i18n";
import { getAvatarForNickname } from "@/lib/avatarUtils";

interface UserContextType {
    nickname: string;
    isLoggedIn: boolean;
    language: Locale;
    ghostMode: boolean;
    avatarGradient: string;
    avatarInitials: string;
    login: (nickname: string, pin: string, ghostMode: boolean) => boolean;
    logout: () => void;
    setLanguage: (lang: Locale) => void;
}

const UserContext = createContext<UserContextType>({
    nickname: "",
    isLoggedIn: false,
    language: "en",
    ghostMode: false,
    avatarGradient: "",
    avatarInitials: "",
    login: () => false,
    logout: () => { },
    setLanguage: () => { },
});

export const useUser = () => useContext(UserContext);

const GHOST_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function UserProvider({ children }: { children: ReactNode }) {
    const [nickname, setNickname] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [language, setLanguageState] = useState<Locale>("en");
    const [ghostMode, setGhostMode] = useState(false);
    const [avatarGradient, setAvatarGradient] = useState("");
    const [avatarInitials, setAvatarInitials] = useState("");
    const ghostTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Load from sessionStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = sessionStorage.getItem("ourmind_user");
        if (stored) {
            try {
                const data = JSON.parse(stored);
                setNickname(data.nickname || "");
                setIsLoggedIn(true);
                setGhostMode(data.ghostMode || false);
                setLanguageState(data.language || "en");
                const avatar = getAvatarForNickname(data.nickname || "");
                setAvatarGradient(avatar.gradient);
                setAvatarInitials(avatar.initials);
            } catch {
                // Invalid data, stay logged out
            }
        }
    }, []);

    // Ghost mode inactivity timer
    useEffect(() => {
        if (!ghostMode || !isLoggedIn) return;

        const resetTimer = () => {
            if (ghostTimerRef.current) clearTimeout(ghostTimerRef.current);
            ghostTimerRef.current = setTimeout(() => {
                sessionStorage.clear();
                window.location.replace("https://www.google.com");
            }, GHOST_TIMEOUT);
        };

        const events = ["mousemove", "keydown", "touchstart", "click", "scroll"];
        events.forEach((e) => window.addEventListener(e, resetTimer));
        resetTimer();

        return () => {
            events.forEach((e) => window.removeEventListener(e, resetTimer));
            if (ghostTimerRef.current) clearTimeout(ghostTimerRef.current);
        };
    }, [ghostMode, isLoggedIn]);

    const login = useCallback((nick: string, pin: string, ghost: boolean): boolean => {
        const usersRaw = localStorage.getItem("ourmind_users");
        let users: Record<string, string> = {};
        if (usersRaw) {
            try { users = JSON.parse(usersRaw); } catch { /* ignore */ }
        }

        if (users[nick]) {
            // Existing user — verify pin
            if (users[nick] !== pin) return false;
        } else {
            // New user — create
            users[nick] = pin;
            localStorage.setItem("ourmind_users", JSON.stringify(users));
        }

        const avatar = getAvatarForNickname(nick);
        setNickname(nick);
        setIsLoggedIn(true);
        setGhostMode(ghost);
        setAvatarGradient(avatar.gradient);
        setAvatarInitials(avatar.initials);

        sessionStorage.setItem("ourmind_user", JSON.stringify({
            nickname: nick,
            ghostMode: ghost,
            language,
        }));

        return true;
    }, [language]);

    const logout = useCallback(() => {
        sessionStorage.clear();
        window.location.replace("https://www.google.com");
    }, []);

    const setLanguage = useCallback((lang: Locale) => {
        setLanguageState(lang);
        const stored = sessionStorage.getItem("ourmind_user");
        if (stored) {
            try {
                const data = JSON.parse(stored);
                data.language = lang;
                sessionStorage.setItem("ourmind_user", JSON.stringify(data));
            } catch { /* ignore */ }
        }
    }, []);

    return (
        <UserContext.Provider
            value={{
                nickname,
                isLoggedIn,
                language,
                ghostMode,
                avatarGradient,
                avatarInitials,
                login,
                logout,
                setLanguage,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

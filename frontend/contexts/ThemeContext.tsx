'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getWeather } from '@/lib/apiClient';
import { getThemeFromWeather, DEFAULT_BG } from '@/lib/weatherTheme';

interface ThemeContextType {
    currentWeather: string | null;
    currentBackgroundColor: string;
}

const ThemeContext = createContext<ThemeContextType>({
    currentWeather: null,
    currentBackgroundColor: DEFAULT_BG,
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [currentWeather, setCurrentWeather] = useState<string | null>(null);
    const [currentBackgroundColor, setCurrentBackgroundColor] = useState(DEFAULT_BG);

    useEffect(() => {
        async function fetchWeather() {
            try {
                const data = await getWeather();
                // The backend returns an object with an `overall` or `weather` field
                const weather = data?.overall || data?.weather || data?.emotional_weather || null;
                setCurrentWeather(weather);
                setCurrentBackgroundColor(getThemeFromWeather(weather));
            } catch (error) {
                console.error('Failed to fetch weather for theme:', error);
                // Stay on default color
            }
        }

        if (user) {
            fetchWeather();
            // Refresh every 5 minutes to keep theme in sync
            const interval = setInterval(fetchWeather, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <ThemeContext.Provider value={{ currentWeather, currentBackgroundColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

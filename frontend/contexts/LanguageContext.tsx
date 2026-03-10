'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

import en from '@/i18n/en.json';
import hi from '@/i18n/hi.json';
import as_ from '@/i18n/as.json';

export type Language = 'en' | 'hi' | 'as';

const translations: Record<Language, Record<string, any>> = { en, hi, as: as_ };

export const LANGUAGE_LABELS: Record<Language, string> = {
    en: 'EN',
    hi: 'हिं',
    as: 'অস',
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => { },
    t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        // Restore from localStorage if available
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('manas_lang') as Language | null;
            if (saved && translations[saved]) return saved;
        }
        return 'en';
    });

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('manas_lang', lang);
        }
    }, []);

    const t = useCallback((key: string): string => {
        // Walk the nested object using dot notation, e.g. "dashboard.greeting"
        const parts = key.split('.');
        let value: any = translations[language];
        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                // Fallback to English
                let fallback: any = translations.en;
                for (const p of parts) {
                    if (fallback && typeof fallback === 'object' && p in fallback) {
                        fallback = fallback[p];
                    } else {
                        return key; // Return raw key if not found anywhere
                    }
                }
                return typeof fallback === 'string' ? fallback : key;
            }
        }
        return typeof value === 'string' ? value : key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}

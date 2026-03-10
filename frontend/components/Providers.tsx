'use client';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { BottomNav } from '@/components/BottomNav';

function ThemedShell({ children }: { children: React.ReactNode }) {
    const { currentBackgroundColor } = useTheme();

    return (
        <div
            className="mx-auto max-w-md min-h-screen shadow-xl relative pb-20"
            style={{
                backgroundColor: currentBackgroundColor,
                transition: 'background-color 0.8s ease',
            }}
        >
            {children}
            <BottomNav />
        </div>
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <LanguageProvider>
                <ThemeProvider>
                    <ThemedShell>{children}</ThemedShell>
                </ThemeProvider>
            </LanguageProvider>
        </AuthProvider>
    );
}

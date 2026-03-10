'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    nickname: string | null;
    signIn: (nickname: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (nickname: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const DUMMY_DOMAIN = '@manas.local';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (DEMO_MODE) {
            // Provide a fake user so all pages render with data
            setUser({ id: 'demo-user', email: 'demo@manas.local' } as User);
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Extract nickname from the dummy email
    const nickname = user?.email ? user.email.replace(DUMMY_DOMAIN, '') : null;

    const signIn = async (nick: string, password: string) => {
        const dummyEmail = `${nick.trim().toLowerCase()}${DUMMY_DOMAIN}`;
        const { error } = await supabase.auth.signInWithPassword({ email: dummyEmail, password });
        return { error: error ? new Error(error.message) : null };
    };

    const signUp = async (nick: string, password: string) => {
        const dummyEmail = `${nick.trim().toLowerCase()}${DUMMY_DOMAIN}`;
        const { error } = await supabase.auth.signUp({ email: dummyEmail, password });
        return { error: error ? new Error(error.message) : null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, nickname, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

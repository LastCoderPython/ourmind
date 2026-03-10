'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';

export default function Login() {
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const { signIn, signUp } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (nickname.trim().length < 3) {
            setError('Nickname must be at least 3 characters.');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            setIsLoading(false);
            return;
        }

        if (isSignUp) {
            const { error: signUpError } = await signUp(nickname, password);
            if (signUpError) {
                setError(signUpError.message);
                setIsLoading(false);
            } else {
                // Auto-login after signup
                const { error: signInError } = await signIn(nickname, password);
                if (signInError) {
                    setError('Account created! Please sign in.');
                    setIsSignUp(false);
                    setIsLoading(false);
                } else {
                    router.push('/');
                }
            }
        } else {
            const { error: signInError } = await signIn(nickname, password);
            if (signInError) {
                setError('Invalid nickname or password.');
                setIsLoading(false);
            } else {
                router.push('/');
            }
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-transparent px-6">
            <div className="w-full max-w-sm space-y-8">

                {/* Header Section */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">🌱</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {isSignUp ? t('login.sign_up') : t('login.welcome')}
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">
                        {isSignUp ? t('login.nickname_placeholder') : t('login.tagline')}
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm p-3 rounded-xl font-medium text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 px-1">{t('login.nickname_label')}</label>
                            <input
                                type="text"
                                required
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder={t('login.nickname_placeholder')}
                                autoComplete="username"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 px-1">{t('login.password_label')}</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder={t('login.password_placeholder')}
                                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                            />
                        </div>
                    </div>

                    {/* Anonymity Notice */}
                    <div className="flex items-start gap-2 bg-sky-50 border border-sky-100 rounded-xl p-3">
                        <ShieldCheck className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-sky-700 leading-relaxed">
                            <strong>{t('login.privacy_title')}</strong> {t('login.privacy_text')}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 mt-2"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isSignUp ? <UserPlus className="w-4 h-4" /> : null}
                                <span>{isSignUp ? t('login.sign_up') : t('login.sign_in')}</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Toggle Sign In / Sign Up */}
                <div className="text-center text-sm font-medium text-slate-500">
                    {isSignUp ? (
                        <>{t('login.toggle_to_signin').split('?')[0]}?{' '}
                            <span onClick={() => { setIsSignUp(false); setError(''); }} className="text-primary font-bold cursor-pointer">{t('login.sign_in')}</span>
                        </>
                    ) : (
                        <>{t('login.toggle_to_signup').split('?')[0]}?{' '}
                            <span onClick={() => { setIsSignUp(true); setError(''); }} className="text-primary font-bold cursor-pointer">{t('login.sign_up')}</span>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

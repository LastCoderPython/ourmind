'use client';

import { ChevronDown, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLanguage, Language, LANGUAGE_LABELS } from '@/contexts/LanguageContext';

const LANGUAGES: Language[] = ['en', 'hi', 'as'];

export function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-app-cream/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
          DS
        </div>
        {title && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">{title}</span>
            {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {/* Language Selector Dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200/50 cursor-pointer hover:bg-slate-200 transition-colors"
          >
            <span className="text-xs font-bold text-slate-600">{LANGUAGE_LABELS[language]}</span>
            <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 min-w-[100px]">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors ${lang === language ? 'text-primary bg-primary/5' : 'text-slate-700'
                    }`}
                >
                  {LANGUAGE_LABELS[lang]} — {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'অসমীয়া'}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>
    </header>
  );
}

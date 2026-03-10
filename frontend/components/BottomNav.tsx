'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, TreePine, BarChart2, BookOpen, LayoutGrid } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.chat'), href: '/chat', icon: MessageSquare },
    { name: t('nav.garden'), href: '/garden', icon: TreePine },
    { name: t('nav.stats'), href: '/stats', icon: BarChart2 },
    { name: t('nav.library'), href: '/library', icon: BookOpen },
    { name: t('nav.wall'), href: '/wall', icon: LayoutGrid },
  ];

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-md bg-white border-t border-slate-100 px-2 pb-6 pt-2">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-500'
                  }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2 : 1.5} />
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

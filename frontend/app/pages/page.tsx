'use client';

// Page Navigation - Quick Access to All Pages

import Link from 'next/link';
import { MessageSquare, TreePine, BarChart2, Users, Home, BookOpen } from 'lucide-react';

const pages = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    description: 'Main dashboard with all widgets',
    color: 'from-orange-400 to-orange-500',
  },
  {
    name: 'AI Chat',
    path: '/chat',
    icon: MessageSquare,
    description: 'Talk to AI companion',
    color: 'from-indigo-400 to-purple-500',
  },
  {
    name: 'Mind Garden',
    path: '/garden',
    icon: TreePine,
    description: 'Watch your wellness grow',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    name: 'Community',
    path: '/wall',
    icon: Users,
    description: 'Share and support others',
    color: 'from-pink-400 to-rose-500',
  },
  {
    name: 'Statistics',
    path: '/stats',
    icon: BarChart2,
    description: 'Track your mood trends',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    name: 'Library',
    path: '/library',
    icon: BookOpen,
    description: 'Coping strategies library',
    color: 'from-amber-400 to-yellow-500',
  },
];

export default function PagesPage() {
  return (
    <main className="min-h-screen bg-[var(--color-app-cream)] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">OurMind Pages</h1>
          <p className="text-slate-500">Quick access to all application pages</p>
        </div>

        {/* Pages Grid */}
        <div className="grid gap-4">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <Link
                key={page.path}
                href={page.path}
                className="group block bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${page.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-lg">{page.name}</h3>
                    <p className="text-sm text-slate-500">{page.description}</p>
                  </div>
                  <div className="text-slate-300 group-hover:text-slate-400 transition-colors">
                    →
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded inline-block">
                  localhost:3001{page.path}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Auth Pages */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Authentication Pages</h2>
          <div className="grid gap-3">
            <Link
              href="/login"
              className="block bg-slate-100 rounded-xl p-4 hover:bg-slate-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Login</span>
                <span className="text-xs text-slate-400">/login</span>
              </div>
            </Link>
            <Link
              href="/signup"
              className="block bg-slate-100 rounded-xl p-4 hover:bg-slate-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Signup</span>
                <span className="text-xs text-slate-400">/signup</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Some pages may show loading states or errors because the backend API isn't connected yet. This is normal!
          </p>
        </div>
      </div>
    </main>
  );
}

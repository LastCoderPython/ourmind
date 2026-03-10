'use client';

import { Header } from '@/components/Header';
import { Wind, Edit3, Eye, User, Brain, Heart, Cloud, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Library() {
  const { t } = useLanguage();

  const strategies = [
    {
      titleKey: 'library.strategies.breathing_title',
      descKey: 'library.strategies.breathing_desc',
      tagKey: 'library.strategies.breathing_tag',
      icon: Wind,
      color: 'blue'
    },
    {
      titleKey: 'library.strategies.journaling_title',
      descKey: 'library.strategies.journaling_desc',
      tagKey: 'library.strategies.journaling_tag',
      icon: Edit3,
      color: 'amber'
    },
    {
      titleKey: 'library.strategies.grounding_title',
      descKey: 'library.strategies.grounding_desc',
      tagKey: 'library.strategies.grounding_tag',
      icon: Eye,
      color: 'emerald'
    },
    {
      titleKey: 'library.strategies.relaxation_title',
      descKey: 'library.strategies.relaxation_desc',
      tagKey: 'library.strategies.relaxation_tag',
      icon: User,
      color: 'purple'
    },
    {
      titleKey: 'library.strategies.reframing_title',
      descKey: 'library.strategies.reframing_desc',
      tagKey: 'library.strategies.reframing_tag',
      icon: Brain,
      color: 'rose'
    },
    {
      titleKey: 'library.strategies.gratitude_title',
      descKey: 'library.strategies.gratitude_desc',
      tagKey: 'library.strategies.gratitude_tag',
      icon: Heart,
      color: 'orange'
    },
    {
      titleKey: 'library.strategies.visualization_title',
      descKey: 'library.strategies.visualization_desc',
      tagKey: 'library.strategies.visualization_tag',
      icon: Cloud,
      color: 'sky'
    },
    {
      titleKey: 'library.strategies.compassion_title',
      descKey: 'library.strategies.compassion_desc',
      tagKey: 'library.strategies.compassion_tag',
      icon: Mail,
      color: 'indigo'
    }
  ];




  const colorMap: Record<string, { bg: string, text: string, tag: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-500', tag: 'text-blue-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', tag: 'text-amber-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', tag: 'text-emerald-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', tag: 'text-purple-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', tag: 'text-rose-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', tag: 'text-orange-600' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-600', tag: 'text-sky-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', tag: 'text-indigo-600' }
  };

  return (
    <main className="min-h-screen pb-24">
      <Header />

      <section className="px-6 mt-4 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{t('library.title')}</h1>
        <p className="text-base font-light text-slate-500 mt-1">{t('library.subtitle')}</p>
      </section>

      <div className="px-6 grid grid-cols-2 gap-4">
        {strategies.map((item, i) => {
          const Icon = item.icon;
          const colors = colorMap[item.color];

          return (
            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center ${colors.text}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 text-[15px]">{t(item.titleKey)}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t(item.descKey)}</p>
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-semibold ${colors.tag} mt-auto`}>
                {t(item.tagKey)}
              </span>
            </div>
          );
        })}
      </div>
    </main>
  );
}

'use client';

import { Header } from '@/components/Header';
import { Droplet, Sun, Wind } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getGarden } from '@/lib/apiClient';

export default function Garden() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [garden, setGarden] = useState<{ plant_stage: number; health_score: number; last_watered: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGarden() {
      try {
        const data = await getGarden();
        setGarden(data);
      } catch (error) {
        console.error("Failed to fetch garden", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchGarden();
  }, [user]);

  // Derive visual representation from plant_stage
  const stageKeys = ['seed', 'sprout', 'sapling', 'young_tree', 'tree', 'flourishing'];
  const stageVisuals = stageKeys.map(key => ({
    name: t(`garden.stages.${key}`),
    emoji: key === 'seed' ? '🌰' : key === 'sprout' ? '🌱' : key === 'sapling' ? '🌿' : key === 'young_tree' ? '🪴' : key === 'tree' ? '🌳' : '🌸',
    text: t(`garden.stage_text.${key}`),
  }));

  const stageIndex = garden ? Math.min(Math.max(garden.plant_stage - 1, 0), 5) : 0;
  const visual = stageVisuals[stageIndex];

  const healthScore = Math.round(garden?.health_score || 0);

  return (
    <main className="min-h-screen flex flex-col pb-24">
      <Header />

      {/* 3D-ish Garden Area Container */}
      <div className="flex-1 bg-gradient-to-b from-blue-50/50 to-emerald-50/50 relative px-6 py-8 flex flex-col items-center justify-center min-h-[400px]">
        {/* Background Decorative Elements */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-white/40 rounded-full blur-2xl"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-yellow-100/40 rounded-full blur-3xl"></div>

        {/* The Plant */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-48 h-48 bg-white/80 backdrop-blur-sm rounded-full shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)] border border-white flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-50 m-2"></div>
            {/* Pulsing effect behind plant */}
            <div className="absolute inset-4 rounded-full bg-emerald-100/50 animate-pulse"></div>

            <span className="text-7xl relative z-10 filter drop-shadow-md transform transition-transform hover:scale-110 duration-500">
              {loading ? "🌱" : visual.emoji}
            </span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">
              {loading ? t('garden.loading') : visual.name}
            </h2>
            <p className="text-slate-500 font-medium max-w-[200px]">
              {loading ? t('garden.loading_desc') : visual.text}
            </p>
          </div>
        </div>
      </div>

      {/* Stats/Controls Area */}
      <div className="px-6 -mt-6 relative z-20 space-y-6">
        {/* Health Progress Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100/50 backdrop-blur-xl">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{t('garden.overall_health')}</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                {loading ? "-" : healthScore}%
              </h3>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100/50">
              {loading ? "..." : (healthScore > 80 ? t('garden.thriving') : healthScore > 50 ? t('garden.growing') : t('garden.needs_care'))}
            </div>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-1000 relative shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
              style={{ width: `${loading ? 0 : healthScore}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>

        {/* Environmental Factors Container */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
              <Droplet className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800">{loading ? "-" : t('garden.watered')}</p>
              <p className="text-xs text-slate-400 font-medium">{t('garden.daily_task')}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
              <Sun className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800">{loading ? "-" : t('garden.sunshine')}</p>
              <p className="text-xs text-slate-400 font-medium">{t('garden.mood_log')}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

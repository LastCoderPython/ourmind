'use client';

// Garden Page with Backend Integration

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sun } from 'lucide-react';
import { gardenApi } from '@/lib/api/garden';
import type { GardenResponse } from '@/lib/api/types';

// Mock data for when backend is not available
const mockGarden: GardenResponse = {
  plant_stage: 2,
  health_score: 77,
  stage_name: 'Sprout',
  progress_percentage: 73,
};

export default function GardenPage() {
  const [garden, setGarden] = useState<GardenResponse>(mockGarden);
  const [loading, setLoading] = useState(false);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    async function fetchGarden() {
      setLoading(true);
      try {
        const data = await gardenApi.getGardenState();
        setGarden(data);
        setUsingMock(false);
      } catch (error) {
        console.log('Using mock garden data (backend not connected)');
        setGarden(mockGarden);
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    }
    fetchGarden();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen pb-24">
        <Header />
        <div className="px-6 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </main>
    );
  }

  const stageNames: Record<number, string> = {
    1: 'Seed',
    2: 'Sprout',
    3: 'Young Plant',
    4: 'Tree',
    5: 'Flowering Tree',
    6: 'Flourishing Tree',
  };

  const plantEmojis: Record<number, string> = {
    1: '🌰',
    2: '🌱',
    3: '🌿',
    4: '🌳',
    5: '🌸',
    6: '🌺',
  };

  const stageName = stageNames[garden.plant_stage] || 'Sprout';
  const emoji = plantEmojis[garden.plant_stage] || '🌱';

  return (
    <main className="min-h-screen pb-24">
      <Header />

      <section className="px-6 py-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mind Garden</h1>
        <p className="text-slate-500 mt-1">Watch your emotional wellness grow</p>
      </section>

      <section className="px-6 py-2">
        <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden shadow-sm bg-gradient-to-b from-sky-100 to-emerald-50 border border-white/50">
          <div className="absolute top-8 right-8 text-amber-400">
            <Sun className="w-16 h-16 opacity-60 fill-current" />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center pt-12">
            <div className="text-center mb-8">
              <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                Stage {garden.plant_stage}
              </span>
              <h2 className="text-2xl font-bold text-slate-800">{stageName}</h2>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-white/40 rounded-full blur-xl"></div>
              <div className="text-8xl relative">{emoji}</div>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-6 bg-white/30 backdrop-blur-md border-t border-white/40">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Health Score</p>
                <p className="text-2xl font-bold text-slate-800">{garden.health_score}%</p>
              </div>
              <p className="text-[10px] font-medium text-slate-500 pb-1">
                Progress: {garden.progress_percentage}%
              </p>
            </div>

            <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600/70 rounded-full transition-all duration-1000"
                style={{ width: `${garden.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-4">
        <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex items-start gap-3">
          <span className="text-2xl">{emoji}</span>
          <p className="text-sm leading-relaxed text-amber-900/80 font-medium">
            Your tree is growing because you showed up today. Keep going!
          </p>
        </div>
      </section>

      <section className="px-6 py-2 grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <p className="text-3xl font-bold text-slate-800">{garden.plant_stage}</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Growth Stage</p>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <p className="text-3xl font-bold text-slate-800">{garden.health_score}%</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Health Score</p>
        </div>
      </section>

      {usingMock && (
        <section className="px-6 py-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <p className="text-xs text-blue-700">
              ℹ️ Using demo data. Connect to backend to see your real garden progress.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}

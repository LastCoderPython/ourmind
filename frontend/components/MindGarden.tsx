'use client';

// Mind Garden Component

import { PLANT_STAGES } from '@/lib/api/types';
import type { GardenResponse } from '@/lib/api/types';

interface MindGardenProps {
  garden: GardenResponse;
  loading?: boolean;
  compact?: boolean;
}

const plantEmojis = {
  1: '🌰',
  2: '🌱',
  3: '🌿',
  4: '🌳',
  5: '🌸',
  6: '🌺',
};

const motivationalMessages = {
  1: 'Every journey begins with a single seed.',
  2: 'Nurturing yourself is the first step to growth.',
  3: 'You\'re developing strong roots of resilience.',
  4: 'Standing tall through life\'s challenges.',
  5: 'Blooming with beauty and strength.',
  6: 'Flourishing in every aspect of life.',
};

export function MindGarden({ garden, loading, compact = false }: MindGardenProps) {
  if (loading) {
    return (
      <div className={`bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex flex-col gap-4 animate-pulse ${compact ? 'p-4' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl"></div>
            <div className="h-5 bg-slate-200 rounded w-20"></div>
          </div>
          <div className="h-5 bg-slate-200 rounded w-10"></div>
        </div>
        <div className="w-full bg-emerald-50 h-3 rounded-full overflow-hidden">
          <div className="bg-emerald-200 h-full rounded-full w-1/2"></div>
        </div>
      </div>
    );
  }

  const stageName = PLANT_STAGES[garden.plant_stage as keyof typeof PLANT_STAGES];
  const emoji = plantEmojis[garden.plant_stage as keyof typeof plantEmojis];
  const message = motivationalMessages[garden.plant_stage as keyof typeof motivationalMessages];

  return (
    <div className={`bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex flex-col gap-4 ${compact ? 'p-4' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl">
            {emoji}
          </div>
          <span className="font-medium text-slate-700">Stage {garden.plant_stage}: {stageName}</span>
        </div>
        <span className="text-emerald-600 font-bold">{garden.progress_percentage}%</span>
      </div>
      <div className="w-full bg-emerald-50 h-3 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
          style={{ width: `${garden.progress_percentage}%` }}
        ></div>
      </div>
      {!compact && (
        <p className="text-sm text-slate-600 italic">{message}</p>
      )}
    </div>
  );
}

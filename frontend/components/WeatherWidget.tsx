'use client';

// Weather Widget Component

import { CloudRain, Cloud, CloudSun, CloudDrizzle, CloudSnow, CloudLightning } from 'lucide-react';
import type { WeatherResponse } from '@/lib/api/types';

interface WeatherWidgetProps {
  weather: WeatherResponse;
  loading?: boolean;
}

const weatherIcons = {
  sunny: CloudSun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudLightning,
  foggy: CloudDrizzle,
  snowy: CloudSnow,
};

export function WeatherWidget({ weather, loading }: WeatherWidgetProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-[24px] p-6 shadow-sm border border-blue-50 flex items-center gap-4 animate-pulse">
        <div className="flex-shrink-0 bg-white/40 p-4 rounded-2xl">
          <div className="w-10 h-10 bg-blue-200 rounded-lg"></div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-blue-200 rounded w-20"></div>
          <div className="h-4 bg-blue-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const Icon = weatherIcons[weather.weather as keyof typeof weatherIcons] || Cloud;

  return (
    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-[24px] p-6 shadow-sm border border-blue-50 flex items-center gap-4">
      <div className="flex-shrink-0 bg-white/40 p-4 rounded-2xl">
        <Icon className="w-10 h-10 text-blue-600" />
      </div>
      <div>
        <h3 className="text-blue-900 font-bold text-lg">{weather.emoji || weather.weather}</h3>
        <p className="text-blue-800/80 text-sm leading-tight">{weather.description}</p>
      </div>
    </div>
  );
}

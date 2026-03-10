'use client';

import { Header } from '@/components/Header';
import { Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMoodHistory } from '@/lib/apiClient';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Helper to map mood strings to numerical values for charting
const moodToValue = {
  'great': 5,
  'good': 4,
  'okay': 3,
  'bad': 2,
  'terrible': 1
};

const valueToMood = {
  5: 'great',
  4: 'good',
  3: 'okay',
  2: 'bad',
  1: 'terrible'
};

export default function Stats() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [moodData, setMoodData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const history = await getMoodHistory();
        if (history && history.length > 0) {
          // Format data for Recharts
          const formatted = history.map((entry: any) => {
            const date = new Date(entry.date);
            return {
              name: date.toLocaleDateString('en-US', { weekday: 'short' }), // "Mon", "Tue"
              value: moodToValue[entry.mood as keyof typeof moodToValue] || 3,
              originalMood: entry.mood,
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            };
          }).reverse(); // Ascending chronological order
          setMoodData(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchStats();
  }, [user]);

  // Calculate average mood
  const avgValue = moodData.length > 0
    ? Math.round(moodData.reduce((acc, curr) => acc + curr.value, 0) / moodData.length)
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
          <p className="text-slate-500 font-medium text-xs mb-1">{data.date}</p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 capitalize">{data.originalMood}</span>
            <span className="text-xl">
              {data.value === 5 ? '🤩' : data.value === 4 ? '😊' : data.value === 3 ? '😐' : data.value === 2 ? '😔' : '😢'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen pb-24">
      <Header />

      <section className="px-6 py-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('stats.title')}</h1>
        <p className="text-slate-500 mt-1">{t('stats.subtitle')}</p>
      </section>

      <div className="px-6 space-y-6">

        {/* Mood Graph Card */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-semibold text-slate-800">{t('stats.mood_history')}</h2>
            <button className="text-sm font-medium text-primary flex items-center gap-1">
              {t('stats.last_7_days')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
            {loading ? (
              <div className="h-48 flex items-center justify-center text-slate-400">{t('stats.loading')}</div>
            ) : moodData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-center px-4">
                {t('stats.no_data')}
              </div>
            ) : (
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moodData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickFormatter={(val) => {
                        if (val === 5) return 'Great';
                        if (val === 3) return 'Okay';
                        if (val === 1) return 'Bad';
                        return '';
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{t('stats.average_mood')}</p>
            <p className="text-xl font-bold text-slate-800 capitalize">
              {loading ? "..." : (avgValue > 0 ? valueToMood[avgValue as keyof typeof valueToMood] : "-")}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{t('stats.current_streak')}</p>
            <p className="text-xl font-bold text-slate-800">
              {loading ? "..." : `${moodData.length} ${t('stats.days')}`}
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}

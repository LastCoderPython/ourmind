'use client';

// Mood Graph Component

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MoodEntry } from '@/lib/api/types';

interface MoodGraphProps {
  moodHistory: MoodEntry[];
  loading?: boolean;
  days?: number;
}

export function MoodGraph({ moodHistory, loading, days = 14 }: MoodGraphProps) {
  // Transform data for chart
  const chartData = useMemo(() => {
    if (!moodHistory || moodHistory.length === 0) {
      return [];
    }

    // Take last 'days' entries
    const recentData = moodHistory.slice(-days);

    return recentData.map((entry) => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      intensity: entry.intensity,
      emotion: entry.emotion,
    }));
  }, [moodHistory, days]);

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 h-64 flex items-center justify-center animate-pulse">
        <div className="h-full w-full bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 h-64 flex items-center justify-center">
        <p className="text-slate-500">No mood data yet. Start tracking your mood!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 10]}
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '12px',
            }}
            formatter={(value, name, props: any) => {
              if (value === undefined) return ['', ''];
              return [`${value}/10`, props?.payload?.emotion || ''];
            }}
          />
          <Line
            type="monotone"
            dataKey="intensity"
            stroke="#ec5b13"
            strokeWidth={2}
            dot={{ fill: '#ec5b13', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

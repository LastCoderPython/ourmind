'use client';

import { Header } from '@/components/Header';
import { CloudRain, CheckCircle2, Circle, Plus, MessageSquare, Sun, Cloud, CloudLightning } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useRef, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getWeather, getGarden, getTasksToday, createTask, completeTask } from '@/lib/apiClient';

export default function Home() {
  const { user, nickname } = useAuth();
  const { t } = useLanguage();

  // States
  const [weather, setWeather] = useState<{ overall: string; temperature: string; description: string } | null>(null);
  const [garden, setGarden] = useState<{ plant_stage: number; health_score: number } | null>(null);
  const [tasks, setTasks] = useState<{ id: string; description: string; completed: boolean }[]>([]);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [loading, setLoading] = useState(true);

  // Load backend data
  useEffect(() => {
    async function fetchData() {
      try {
        const [wData, gData, tData] = await Promise.all([
          getWeather(),
          getGarden(),
          getTasksToday()
        ]);
        setWeather(wData as any);
        setGarden(gData);
        setTasks(tData || []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchData();
  }, [user]);

  // Midnight reset polling — checks every 60s if a new day has started
  const lastDateRef = useRef(new Date().toDateString());
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toDateString();
      if (today !== lastDateRef.current) {
        lastDateRef.current = today;
        // New day detected — reset tasks and re-fetch
        setTasks([]);
        setNewTaskDesc('');
        // Re-fetch fresh data from backend/demo
        (async () => {
          try {
            const [wData, gData, tData] = await Promise.all([
              getWeather(), getGarden(), getTasksToday()
            ]);
            setWeather(wData as any);
            setGarden(gData);
            setTasks(tData || []);
          } catch (e) {
            console.error('Midnight refresh failed', e);
          }
        })();
      }
    }, 60_000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));
    try {
      await completeTask(taskId, !currentStatus);
    } catch (e) {
      // Revert on failure
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: currentStatus } : t));
    }
  };

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const desc = newTaskDesc.trim();
    setNewTaskDesc('');

    // Optimistic update
    setTasks(prev => [...prev, { id: tempId, description: desc, completed: false }]);

    try {
      await createTask([desc]);
      // Refetch true tasks to get real IDs
      const tData = await getTasksToday();
      setTasks(tData || []);
    } catch (e) {
      console.error(e);
      // Revert on failure
      setTasks(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const taskPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Mood → numeric score for plant growth calculation
  const weatherToMood: Record<string, number> = {
    sunny: 100, cloudy: 75, rainy: 50, foggy: 40, stormy: 20
  };
  const moodScore = weather ? (weatherToMood[weather.overall.toLowerCase()] ?? 50) : 50;
  const plantGrowthScore = Math.round((0.7 * taskPercent) + (0.3 * moodScore));

  // Derive weather icon visually
  const ovr = weather?.overall?.toLowerCase() || '';
  const WeatherIcon = ovr.includes('storm') ? CloudLightning :
    ovr.includes('rain') ? CloudRain :
      ovr.includes('sun') ? Sun : Cloud;

  const stageKeys = ['seed', 'sprout', 'sapling', 'young_tree', 'tree', 'flourishing'];
  const currentStageName = garden ? t(`garden.stages.${stageKeys[Math.min(garden.plant_stage - 1, 5)]}`) : t('garden.stages.seed');

  return (
    <main className="min-h-screen pb-24">
      <Header />

      <section className="px-6 py-4">
        <h1 className="text-2xl font-semibold text-slate-800">
          {t('dashboard.greeting')}{nickname ? `, ${nickname}` : ''} 👋
        </h1>
        <p className="text-slate-500 mt-1">{t('dashboard.subtitle')}</p>
      </section>

      <div className="px-6 space-y-6">
        {/* Mood Card */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-[24px] p-6 shadow-sm border border-blue-50 flex items-center gap-4">
          <div className="flex-shrink-0 bg-white/40 p-4 rounded-2xl">
            {loading ? <Cloud className="w-10 h-10 text-blue-400 opacity-50 animate-pulse" /> : <WeatherIcon className="w-10 h-10 text-blue-600" />}
          </div>
          <div>
            <h3 className="text-blue-900 font-bold text-lg capitalize">
              {loading ? t('dashboard.weather_loading') : weather?.overall || t('dashboard.weather_unknown')}
            </h3>
            <p className="text-blue-800/80 text-sm leading-tight">
              {loading ? t('dashboard.weather_loading_desc') : weather?.description || t('dashboard.weather_no_data')}
            </p>
          </div>
        </div>

        {/* Garden Progress */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800 px-1">{t('dashboard.garden_title')}</h2>
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl">
                  🌱
                </div>
                <span className="font-medium text-slate-700">
                  {loading ? t('dashboard.garden_loading') : currentStageName}
                </span>
              </div>
              <span className="text-emerald-600 font-bold">
                {loading ? "-" : plantGrowthScore}%
              </span>
            </div>
            <div className="w-full bg-emerald-50 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${loading ? 0 : plantGrowthScore}%` }}
              />
            </div>
            {!loading && (
              <p className="text-xs text-slate-400 text-center">
                📊 {taskPercent}% tasks · {moodScore}% mood
              </p>
            )}
          </div>
        </section>

        {/* Today's Self-Care Plan */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-semibold text-slate-800">{t('dashboard.tasks_title')}</h2>
            <div className="flex items-center gap-2">
              {!loading && tasks.length > 0 && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{taskPercent}%</span>
              )}
              <span className="text-sm font-medium text-slate-400">
                {loading ? "-/-" : `${completedCount}/${tasks.length}`}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {loading && <div className="text-center text-slate-400 text-sm py-4">{t('dashboard.tasks_loading')}</div>}
            {!loading && tasks.length === 0 && <div className="text-center text-slate-400 text-sm py-4">{t('dashboard.tasks_empty')}</div>}

            {!loading && tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id, task.completed)}
                className={`flex items-center p-4 rounded-2xl border shadow-sm cursor-pointer transition-colors ${task.completed ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-200 flex-shrink-0" />
                )}
                <span className={`ml-4 text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {task.description}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddTask} className="pt-2 relative flex items-center">
            <input
              type="text"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              placeholder={t('dashboard.tasks_placeholder')}
              className="w-full bg-white border-slate-100 rounded-full py-3.5 pl-6 pr-14 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-slate-600 placeholder:text-slate-400 outline-none"
            />
            <button type="submit" disabled={!newTaskDesc.trim()} className="absolute right-2 bg-emerald-500 text-white p-2 rounded-full hover:bg-emerald-600 transition-colors disabled:opacity-50">
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </section>

        {/* AI CTA */}
        <section className="pt-4">
          <Link href="/chat" className="w-full bg-gradient-to-br from-indigo-400 to-purple-400 text-white py-5 rounded-[24px] font-semibold text-lg shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-transform">
            <MessageSquare className="w-6 h-6" />
            <span>{t('dashboard.cta_chat')}</span>
          </Link>
        </section>
      </div>
    </main>
  );
}

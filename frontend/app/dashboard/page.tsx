'use client';

// Dashboard Page

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { WeatherWidget } from '@/components/WeatherWidget';
import { MindGarden } from '@/components/MindGarden';
import { TaskList } from '@/components/TaskList';
import { MoodGraph } from '@/components/MoodGraph';
import { DailyCheckin } from '@/components/DailyCheckin';
import { MessageSquare } from 'lucide-react';
import { weatherApi } from '@/lib/api/weather';
import { gardenApi } from '@/lib/api/garden';
import { tasksApi } from '@/lib/api/tasks';
import { moodsApi } from '@/lib/api/moods';
import type { WeatherResponse, GardenResponse, TodayTasksResponse, MoodHistoryResponse } from '@/lib/api/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showCheckin, setShowCheckin] = useState(false);

  // Data states
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [garden, setGarden] = useState<GardenResponse | null>(null);
  const [tasks, setTasks] = useState<TodayTasksResponse | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodHistoryResponse | null>(null);

  // Loading states
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingGarden, setLoadingGarden] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingMoods, setLoadingMoods] = useState(true);

  // Redirect if not authenticated (disabled for demo)
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     router.push('/login');
  //   }
  // }, [user, authLoading, router]);

  // Fetch weather data
  useEffect(() => {
    async function fetchWeather() {
      try {
        const data = await weatherApi.getCurrentWeather();
        setWeather(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        // Set default weather on error
        setWeather({
          weather: 'sunny',
          emoji: '☀️',
          description: 'Unable to load weather data',
        });
      } finally {
        setLoadingWeather(false);
      }
    }
    fetchWeather();
  }, []);

  // Fetch garden data
  useEffect(() => {
    async function fetchGarden() {
      try {
        const data = await gardenApi.getGardenState();
        setGarden(data);
      } catch (error) {
        console.log('Using mock garden data');
        setGarden({
          plant_stage: 2,
          health_score: 77,
          stage_name: 'Sprout',
          progress_percentage: 73,
        });
      } finally {
        setLoadingGarden(false);
      }
    }
    fetchGarden();
  }, []);

  // Fetch tasks
  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await tasksApi.getTodayTasks();
        setTasks(data);
      } catch (error) {
        console.log('Using mock tasks data');
        setTasks({
          tasks: [
            { id: '1', title: 'Meditate for 10 minutes', completed: false, created_at: new Date().toISOString() },
            { id: '2', title: 'Journal your thoughts', completed: true, created_at: new Date().toISOString() },
            { id: '3', title: 'Take a walk outside', completed: false, created_at: new Date().toISOString() },
          ],
          completed_count: 1,
          total_count: 3,
        });
      } finally {
        setLoadingTasks(false);
      }
    }
    fetchTasks();
  }, []);

  // Fetch mood history
  useEffect(() => {
    async function fetchMoodHistory() {
      try {
        const data = await moodsApi.getMoodHistory();
        setMoodHistory(data);
      } catch (error) {
        console.log('Using mock mood data');
        setMoodHistory({
          history: [
            { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), emotion: 'Happy', intensity: 7 },
            { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), emotion: 'Calm', intensity: 6 },
            { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), emotion: 'Anxious', intensity: 4 },
            { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), emotion: 'Happy', intensity: 8 },
            { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), emotion: 'Content', intensity: 7 },
            { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), emotion: 'Grateful', intensity: 7 },
            { date: new Date().toISOString(), emotion: 'Good', intensity: 7 },
          ],
        });
      } finally {
        setLoadingMoods(false);
      }
    }
    fetchMoodHistory();
  }, []);

  const handleTaskComplete = async (taskId: string) => {
    try {
      await tasksApi.completeTask({ task_id: taskId });
      // Refresh tasks and garden after completing a task
      const [tasksData, gardenData] = await Promise.all([
        tasksApi.getTodayTasks(),
        gardenApi.getGardenState(),
      ]);
      setTasks(tasksData);
      setGarden(gardenData);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleTaskCreate = async (title: string) => {
    try {
      await tasksApi.createTask({ title });
      const data = await tasksApi.getTodayTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleCheckinComplete = (mood: number, emotions: string[]) => {
    console.log('Check-in completed:', { mood, emotions });
    // Here you would send the check-in data to the backend
    setShowCheckin(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-app-cream)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <main className="min-h-screen pb-24">
      <Header />

      <section className="px-6 py-4">
        <h1 className="text-2xl font-semibold text-slate-800">
          Good to see you, {user.user_metadata?.nickname || user.email?.split('@')[0] || 'Friend'} 👋
        </h1>
        <p className="text-slate-500 mt-1">How are you feeling today?</p>
      </section>

      <div className="px-6 space-y-6">
        {/* Emotional Weather */}
        <WeatherWidget weather={weather!} loading={loadingWeather} />

        {/* Daily Check-in CTA */}
        <section>
          <button
            onClick={() => setShowCheckin(true)}
            className="w-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white py-4 rounded-2xl font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            ✨ Start Daily Check-in
          </button>
        </section>

        {/* Garden Progress */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-semibold text-slate-800">Your Garden</h2>
            <Link href="/garden" className="text-sm text-[var(--color-primary)] font-medium">
              View Details →
            </Link>
          </div>
          <MindGarden garden={garden!} loading={loadingGarden} compact />
        </section>

        {/* Today's Tasks */}
        <section>
          <TaskList
            tasksData={tasks!}
            loading={loadingTasks}
            onTaskComplete={handleTaskComplete}
            onTaskCreate={handleTaskCreate}
          />
        </section>

        {/* Mood Analytics */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-semibold text-slate-800">Mood Trends</h2>
            <Link href="/stats" className="text-sm text-[var(--color-primary)] font-medium">
              View Stats →
            </Link>
          </div>
          <MoodGraph moodHistory={moodHistory?.history || []} loading={loadingMoods} days={7} />
        </section>

        {/* AI Chat CTA */}
        <section className="pt-4">
          <Link
            href="/chat"
            className="w-full bg-gradient-to-br from-indigo-400 to-purple-400 text-white py-5 rounded-[24px] font-semibold text-lg shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <MessageSquare className="w-6 h-6" />
            <span>Talk to AI Companion</span>
          </Link>
        </section>
      </div>

      {/* Daily Check-in Modal */}
      <DailyCheckin
        isOpen={showCheckin}
        onClose={() => setShowCheckin(false)}
        onComplete={handleCheckinComplete}
      />
    </main>
  );
}

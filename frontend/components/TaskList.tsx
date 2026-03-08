'use client';

// Task List Component

import { useState } from 'react';
import { CheckCircle2, Circle, Plus } from 'lucide-react';
import type { Task, TodayTasksResponse } from '@/lib/api/types';
import { tasksApi } from '@/lib/api/tasks';

interface TaskListProps {
  tasksData: TodayTasksResponse;
  loading?: boolean;
  onTaskComplete?: (taskId: string) => void;
  onTaskCreate?: (title: string) => void;
}

export function TaskList({ tasksData, loading, onTaskComplete, onTaskCreate }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsAdding(true);
    try {
      if (onTaskCreate) {
        onTaskCreate(newTaskTitle);
      } else {
        await tasksApi.createTask({ title: newTaskTitle });
      }
      setNewTaskTitle('');
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      if (onTaskComplete) {
        onTaskComplete(task.id);
      } else {
        await tasksApi.completeTask({ task_id: task.id });
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-lg font-semibold text-slate-800">Today's Self-Care Plan</h2>
        <span className="text-sm font-medium text-slate-400">
          {tasksData.completed_count}/{tasksData.total_count}
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasksData.tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => !task.completed && handleToggleTask(task)}
            className={`flex items-center p-4 rounded-2xl border shadow-sm cursor-pointer transition-colors ${
              task.completed
                ? 'bg-emerald-50/30 border-emerald-100'
                : 'bg-white border-slate-100 hover:border-emerald-200'
            }`}
          >
            {task.completed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle className="w-6 h-6 text-slate-200 flex-shrink-0" />
            )}
            <span
              className={`ml-4 ${
                task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
              }`}
            >
              {task.title}
            </span>
          </div>
        ))}
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleAddTask} className="pt-2 relative flex items-center">
        <input
          type="text"
          placeholder="Add a task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          disabled={isAdding}
          className="w-full bg-white border-slate-100 rounded-full py-3.5 pl-6 pr-14 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-slate-600 placeholder:text-slate-400 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isAdding || !newTaskTitle.trim()}
          className="absolute right-2 bg-emerald-500 text-white p-2 rounded-full hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

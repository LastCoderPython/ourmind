// Tasks API Service

import api from '../api';
import type {
  Task,
  CreateTaskRequest,
  CompleteTaskRequest,
  TodayTasksResponse,
} from './types';

const TASKS_ENDPOINTS = {
  create: '/api/tasks',
  getToday: '/api/tasks/today',
  complete: '/api/tasks/complete',
};

/**
 * Get today's tasks
 * @returns Today's tasks with completion counts
 */
export async function getTodayTasks(): Promise<TodayTasksResponse> {
  return api.get<TodayTasksResponse>(TASKS_ENDPOINTS.getToday);
}

/**
 * Create a new task
 * @param request - Task creation request
 * @returns Created task
 */
export async function createTask(request: CreateTaskRequest): Promise<Task> {
  return api.post<Task>(TASKS_ENDPOINTS.create, request);
}

/**
 * Mark a task as complete
 * @param request - Task completion request
 * @returns Success response
 */
export async function completeTask(request: CompleteTaskRequest): Promise<{ success: boolean }> {
  return api.post<{ success: boolean }>(TASKS_ENDPOINTS.complete, request);
}

// Export tasks API object
export const tasksApi = {
  getTodayTasks,
  createTask,
  completeTask,
};

// API Types for OurMind Backend Integration

// ==================== Chat API ====================
export interface ChatRequest {
  session_id: string;
  message: string;
}

export interface ChatResponse {
  session_id: string;
  response: string;
  emotions: EmotionScore[];
  distress_scores: DistressScore[];
  dominant_emotion: string;
  crisis: boolean;
}

export interface EmotionScore {
  emotion: string;
  score: number;
}

export interface DistressScore {
  label: string;
  score: number;
}

// ==================== Weather API ====================
export interface WeatherResponse {
  weather: string;
  emoji: string;
  description: string;
}

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy';

// ==================== Garden API ====================
export interface GardenResponse {
  plant_stage: number;
  health_score: number;
  stage_name: string;
  progress_percentage: number;
}

export type PlantStage = 1 | 2 | 3 | 4 | 5 | 6;

export const PLANT_STAGES = {
  1: 'Seed',
  2: 'Sprout',
  3: 'Young Plant',
  4: 'Tree',
  5: 'Flowering Tree',
  6: 'Flourishing Tree'
} as const;

// ==================== Moods API ====================
export interface MoodHistoryResponse {
  history: MoodEntry[];
}

export interface MoodEntry {
  date: string;
  emotion: string;
  intensity: number;
}

// ==================== Tasks API ====================
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  due_date?: string;
  category?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  category?: string;
}

export interface CompleteTaskRequest {
  task_id: string;
}

export interface TodayTasksResponse {
  tasks: Task[];
  completed_count: number;
  total_count: number;
}

// ==================== Posts API ====================
export interface Post {
  id: string;
  author: string;
  content: string;
  created_at: string;
  reactions: ReactionCounts;
  is_anonymous: boolean;
}

export interface ReactionCounts {
  support: number;
  relate: number;
  proud: number;
}

export interface CreatePostRequest {
  content: string;
  is_anonymous: boolean;
}

export interface ReactRequest {
  post_id: string;
  reaction_type: 'support' | 'relate' | 'proud';
}

export interface PostsResponse {
  posts: Post[];
}

// ==================== Auth Types ====================
export interface User {
  id: string;
  email: string;
  nickname?: string;
  created_at: string;
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// ==================== Common API Types ====================
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

// ==================== Dashboard ====================
export interface DashboardData {
  weather: WeatherResponse;
  garden: GardenResponse;
  tasks: TodayTasksResponse;
  mood_history: MoodHistoryResponse;
}

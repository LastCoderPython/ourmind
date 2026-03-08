// Moods API Service

import api from '../api';
import type { MoodHistoryResponse } from './types';

const MOODS_ENDPOINTS = {
  getHistory: '/api/moods/history',
};

/**
 * Get mood history for analytics
 * @returns Mood history data with date, emotion, and intensity
 */
export async function getMoodHistory(): Promise<MoodHistoryResponse> {
  return api.get<MoodHistoryResponse>(MOODS_ENDPOINTS.getHistory);
}

// Export moods API object
export const moodsApi = {
  getMoodHistory,
};

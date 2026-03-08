// Weather API Service

import api from '../api';
import type { WeatherResponse } from './types';

const WEATHER_ENDPOINTS = {
  getCurrent: '/api/weather',
};

/**
 * Get current emotional weather
 * @returns Weather data with emoji and description
 */
export async function getCurrentWeather(): Promise<WeatherResponse> {
  return api.get<WeatherResponse>(WEATHER_ENDPOINTS.getCurrent);
}

// Export weather API object
export const weatherApi = {
  getCurrentWeather,
};

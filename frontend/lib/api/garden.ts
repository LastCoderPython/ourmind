// Garden API Service

import api from '../api';
import type { GardenResponse } from './types';

const GARDEN_ENDPOINTS = {
  getState: '/api/garden',
};

/**
 * Get current garden state
 * @returns Garden data with plant stage and health score
 */
export async function getGardenState(): Promise<GardenResponse> {
  return api.get<GardenResponse>(GARDEN_ENDPOINTS.getState);
}

// Export garden API object
export const gardenApi = {
  getGardenState,
};

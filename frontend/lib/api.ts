// Main API Client

import { env } from './env';
import { authHelpers } from './supabase';
import type { ApiError } from './api/types';

// API Error class
export class ApiException extends Error {
  constructor(
    public statusCode: number,
    public data: ApiError,
    message?: string
  ) {
    super(message || data.message || 'An error occurred');
    this.name = 'ApiException';
  }
}

// API Client configuration
const API_CONFIG = {
  baseURL: env.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper to get auth headers
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await authHelpers.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Main fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  const authHeaders = await getAuthHeaders();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...authHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        throw new ApiException(
          response.status,
          { message: response.statusText },
          `HTTP ${response.status}: ${response.statusText}`
        );
      }
      return undefined as T;
    }

    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      throw new ApiException(
        response.status,
        data as ApiError,
        data.message || `HTTP ${response.status}`
      );
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiException) {
      throw error;
    }

    // Handle network errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiException(408, { message: 'Request timeout' });
      }
      throw new ApiException(0, { message: error.message }, error.message);
    }

    throw new ApiException(0, { message: 'Unknown error' });
  }
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string) => fetchAPI<T>(endpoint),

  post: <T>(endpoint: string, data: unknown) =>
    fetchAPI<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: unknown) =>
    fetchAPI<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data: unknown) =>
    fetchAPI<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    fetchAPI<T>(endpoint, {
      method: 'DELETE',
    }),
};

// Export API client
export default api;

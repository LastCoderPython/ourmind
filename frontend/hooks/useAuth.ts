// useAuth Hook

// Re-export useAuth from the context for convenience
export { useAuth } from '@/contexts/AuthContext';

// Additional auth-related hooks can be added here

/**
 * Hook to get the current user's JWT token for API requests
 */
export async function getAuthToken() {
  const { authHelpers } = await import('@/lib/supabase');
  return authHelpers.getAccessToken();
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { useAuth: useContextAuth } = require('@/contexts/AuthContext');
  const { user, loading } = useContextAuth();
  return {
    isAuthenticated: !!user,
    loading,
  };
}

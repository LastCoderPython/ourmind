// Supabase Client Configuration

import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Validate environment variables
const supabaseUrl = env.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = env.supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null;

// Auth helper functions
export const authHelpers = {
  // Get current session
  async getSession() {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Get current user
  async getUser() {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Sign up
  async signUp(email: string, password: string, nickname?: string) {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  // Sign in
  async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get JWT token for API requests
  async getAccessToken() {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabase) {
      // Return a no-op subscription if supabase is not initialized
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },
};

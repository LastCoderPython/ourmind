// Environment Variables Configuration

export const env = {
  // Supabase Configuration
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',

  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',

  // Google Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY || '',

  // App Configuration
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Feature Flags
  enableBiofeedback: process.env.NEXT_PUBLIC_ENABLE_BIOFEEDBACK === 'true',
  enableGhostMode: process.env.NEXT_PUBLIC_ENABLE_GHOST_MODE === 'true',
} as const;

// Validation
export function validateEnv() {
  const required = [
    'supabaseUrl',
    'supabaseAnonKey',
    'apiUrl',
  ] as const;

  const missing = required.filter(key => !env[key]);

  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }

  return missing.length === 0;
}

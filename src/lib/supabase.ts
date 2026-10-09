import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-publishable-key'
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Zenvilo Supabase] Missing or default VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY environment variables. Please provide your Supabase Project URL and Public Anon Key in .env'
  );
}

// Fallback dummy URL and anon key to prevent createClient constructor from throwing if not set
const validUrl = isSupabaseConfigured
  ? supabaseUrl
  : 'https://placeholder.supabase.co';
const validKey = isSupabaseConfigured
  ? supabaseAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient<Database>(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Diagnostic helper to test the live connection to Supabase
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  error?: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Supabase credentials are not configured in environment variables.',
      error: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY',
    };
  }

  try {
    // Attempt a light query to products table
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (error) {
      // If table doesn't exist yet (before migration is run)
      if (error.code === '42P01') {
        return {
          connected: true,
          message:
            'Connected to Supabase project! However, database tables have not been created yet. Please execute the SQL migration in Supabase SQL Editor.',
          error: error.message,
        };
      }
      return {
        connected: false,
        message: 'Supabase returned an error during connection test.',
        error: error.message,
      };
    }

    return {
      connected: true,
      message: 'Successfully connected to Supabase and queried tables.',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: 'Failed to communicate with Supabase API.',
      error: err?.message || String(err),
    };
  }
}

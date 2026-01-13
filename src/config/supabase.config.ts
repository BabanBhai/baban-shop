import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== '' &&
    supabaseAnonKey !== ''
);

// Create Supabase client or null if not configured
export const supabase: SupabaseClient | null = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    })
    : null;

// Log configuration status
if (!isSupabaseConfigured) {
    console.warn('🔥 DEMO MODE: Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.');
    console.info('📖 See DEPLOYMENT_GUIDE.md for setup instructions.');
} else {
    console.log('✅ Supabase configured successfully');
}

// Export admin email for role checking
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

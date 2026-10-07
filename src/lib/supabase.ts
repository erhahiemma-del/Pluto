import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
// Uses environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY if available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

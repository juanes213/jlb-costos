
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Supabase client initialization
// These environment variables should be set in your Supabase project
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

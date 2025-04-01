
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Supabase client initialization with your project details
const supabaseUrl = 'https://xkiqeoxngnrmqfbdagcv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhraXFlb3huZ25ybXFmYmRhZ2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODgxNTIsImV4cCI6MjA1NzM2NDE1Mn0.vOaOGnNsrMFWPmjixDA_8G5zP_S50Lcy4U7XXLK7L4M';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage // Explicitly set storage to localStorage
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey  // Explicitly add the API key to all requests
    }
  }
});

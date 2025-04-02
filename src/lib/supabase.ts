
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
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2 // Limit realtime events per second
    }
  }
});

// Helper function to throttle API requests
export const throttledRequest = (() => {
  const queue: (() => Promise<any>)[] = [];
  let isProcessing = false;
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const processQueue = async () => {
    if (isProcessing || queue.length === 0) return;
    
    isProcessing = true;
    try {
      const request = queue.shift();
      if (request) {
        await request();
        // Add a small delay between requests
        await delay(300);
      }
    } catch (error) {
      console.error("Error processing request:", error);
    } finally {
      isProcessing = false;
      if (queue.length > 0) {
        processQueue();
      }
    }
  };

  return (request: () => Promise<any>) => {
    return new Promise((resolve, reject) => {
      queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      processQueue();
    });
  };
})();

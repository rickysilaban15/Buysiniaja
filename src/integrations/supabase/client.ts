// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY; // <- Ganti ini

console.log('🔍 Supabase Config Check:', {
  url: SUPABASE_URL ? '✅ Set' : '❌ Missing',
  key: SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing', // <- Dan ini
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) { // <- Dan ini
  const errorMsg = 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.';
  console.error('❌', errorMsg);
  throw new Error(errorMsg);
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, { // <- Dan ini
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

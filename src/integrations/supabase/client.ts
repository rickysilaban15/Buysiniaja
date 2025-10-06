// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Gunakan VITE_SUPABASE_ANON_KEY bukan VITE_SUPABASE_PUBLISHABLE_KEY
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Environment Check:', {
  url: SUPABASE_URL ? '✅ SET' : '❌ MISSING',
  key: SUPABASE_ANON_KEY ? '✅ SET' : '❌ MISSING',
  keyType: SUPABASE_ANON_KEY?.includes('service_role') ? '❌ SERVICE ROLE' : '✅ ANON KEY'
});

// Validasi ketat
if (!SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL is required');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required');
}

if (SUPABASE_ANON_KEY.includes('service_role')) {
  throw new Error('SECURITY ERROR: Service role key detected in client-side code! Use anon key only.');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

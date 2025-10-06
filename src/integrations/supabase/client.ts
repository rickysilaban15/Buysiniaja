// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback ke hardcode jika env variables tidak ada
const finalUrl = SUPABASE_URL || 'https://onpbszgldatcnnzodmtg.supabase.co';
const finalKey = SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucGJzemdsZGF0Y25uem9kbXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODU4MzQsImV4cCI6MjA3NDY2MTgzNH0.8re0S7YVwVaoUrtgxZ7eCvxPUkT4eW10OHXpnCJhzNE';

console.log('🔍 Environment Status:', {
  envUrl: SUPABASE_URL ? 'SET' : 'MISSING',
  envKey: SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
  usingFallback: !SUPABASE_URL || !SUPABASE_ANON_KEY
});

export const supabase = createClient<Database>(finalUrl, finalKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

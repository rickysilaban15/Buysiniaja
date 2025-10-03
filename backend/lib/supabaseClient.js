// backend/lib/supabaseClient.js atau similar
import { createClient } from '@supabase/supabase-js';

// PASTIKAN menggunakan SERVICE ROLE KEY, bukan yang dari frontend
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // ← INI YANG BENAR

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});
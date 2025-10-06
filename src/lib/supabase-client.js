// src/lib/supabase-client.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://onpbszgldatcnnzodmtg.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucGJzemdsZGF0Y25uem9kbXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODU4MzQsImV4cCI6MjA3NDY2MTgzNH0.8re0S7YVwVaoUrtgxZ7eCvxPUkT4eW10OHXpnCJhzNE'

// Validasi credentials
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase configuration')
}

// Create client dengan error handling
let supabaseInstance;

try {
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
  console.log('✅ Supabase client created successfully');
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error);
  throw error;
}

export default supabaseInstance;

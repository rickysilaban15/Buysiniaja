// src/lib/supabase-client.js
import { createClient } from '@supabase/supabase-js'

// Hardcode credentials
const SUPABASE_URL = 'https://onpbszgldatcnnzodmtg.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucGJzemdsZGF0Y25uem9kbXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODU4MzQsImV4cCI6MjA3NDY2MTgzNH0.8re0S7YVwVaoUrtgxZ7eCvxPUkT4eW10OHXpnCJhzNE'

// Validasi
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase configuration')
}

// Buat client dengan isolation
let supabaseInstance = null

function createSupabaseClient() {
  if (supabaseInstance) return supabaseInstance
  
  console.log('🚀 Creating isolated Supabase client...')
  
  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
    console.log('✅ Supabase client created successfully!')
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
    throw error
  }
  
  return supabaseInstance
}

// Export singleton instance
const supabase = createSupabaseClient()
export default supabase
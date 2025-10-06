// src/lib/supabase-client.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://onpbszgldatcnnzodmtg.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucGJzemdsZGF0Y25uem9kbXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODU4MzQsImV4cCI6MjA3NDY2MTgzNH0.8re0S7YVwVaoUrtgxZ7eCvxPUkT4eW10OHXpnCJhzNE'

console.log('🔧 Initializing Supabase...')

// Validasi
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase configuration')
}

// Buat client
let supabaseInstance = null

try {
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  })
  console.log('✅ Supabase client created successfully!')
  
  // ✅ EXPORT KE WINDOW UNTUK TESTING DI CONSOLE
  if (typeof window !== 'undefined') {
    window.supabase = supabaseInstance
    console.log('🌐 Supabase exported to window.supabase')
  }
  
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error)
  // Fallback
  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY)
    console.log('✅ Supabase client created (fallback)!')
    
    // Export fallback juga
    if (typeof window !== 'undefined') {
      window.supabase = supabaseInstance
    }
  } catch (fallbackError) {
    console.error('❌ Supabase fallback also failed:', fallbackError)
    throw fallbackError
  }
}

export default supabaseInstance

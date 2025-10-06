
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
  
  // ✅ AUTO-EXPORT KE WINDOW
  if (typeof window !== 'undefined') {
    window.supabase = supabaseInstance
    
    // Tambahkan test function langsung
    window.testSupabase = async () => {
      console.log('🧪 Testing Supabase connection...')
      try {
        const { data, error } = await supabaseInstance
          .from('products')
          .select('id, name, price')
          .limit(2)
        
        if (error) {
          console.error('❌ Supabase test failed:', error)
          return { success: false, error }
        }
        
        console.log('✅ Supabase test successful! Data:', data)
        return { success: true, data }
      } catch (err) {
        console.error('💥 Supabase test error:', err)
        return { success: false, error: err }
      }
    }
    
    console.log('🌐 Supabase exported to window.supabase')
    console.log('🔧 Test function: testSupabase()')
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
07

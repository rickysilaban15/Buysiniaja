
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Hardcode credentials - langsung pakai values
const supabaseUrl = 'https://onpbszgldatcnnzodmtg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucGJzemdsZGF0Y25uem9kbXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODU4MzQsImV4cCI6MjA3NDY2MTgzNH0.8re0S7YVwVaoUrtgxZ7eCvxPUkT4eW10OHXpnCJhzNE'

console.log('🚀 Initializing Supabase Client...', {
  url: supabaseUrl,
  keyLength: supabaseKey?.length || 0
})

// Validasi sederhana
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration')
}

// Create client langsung tanpa config kompleks
const supabase = createClient(supabaseUrl, supabaseKey)

console.log('✅ Supabase client created successfully!')


// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Hardcode credentials - langsung pakai values
const supabaseUrl = 'https://onpbszgldatcnnzodmtg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucGJzemdsZGF0Y25uem9kbXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODU4MzQsImV4cCI6MjA3NDY2MTgzNH0.8re0S7YVwVaoUrtgxZ7eCvxPUkT4eW10OHXpnCJhzNE'

console.log('🚀 Initializing Supabase Client...', {
  url: supabaseUrl,
  keyLength: supabaseKey?.length || 0
})

// Validasi sederhana
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration')
}

// Create client langsung tanpa config kompleks
const supabase = createClient(supabaseUrl, supabaseKey)

console.log('✅ Supabase client created successfully!')


export default supabase
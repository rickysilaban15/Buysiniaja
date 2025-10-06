// src/utils/global-exports.js
import supabase from '../lib/supabase-client'

// Export semua global utilities untuk testing
if (typeof window !== 'undefined') {
  // Supabase
  window.supabase = supabase
  
  // Test function
  window.testSupabase = async () => {
    console.log('🧪 Testing Supabase connection...')
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price')
        .limit(3)
      
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
  
  // Quick query function
  window.supabaseQuery = (table, select = '*', limit = 10) => {
    return supabase
      .from(table)
      .select(select)
      .limit(limit)
  }
  
  console.log('🔧 Global exports loaded!')
  console.log('Available functions:')
  console.log('- testSupabase()')
  console.log('- supabaseQuery(table, select, limit)') 
  console.log('- window.supabase (direct access)')
}

export { supabase }
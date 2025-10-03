// test-admin-login.mjs
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key exists:', !!serviceRoleKey);
console.log('Key starts with:', serviceRoleKey?.substring(0, 10));

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testAdminLogin() {
  try {
    console.log('\n🔐 Testing admin login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin3@buysini.com',
      password: 'buysini'
    });

    if (error) {
      console.log('❌ Login failed:', error.message);
      console.log('Error status:', error.status);
      console.log('Error code:', error.code);
      return;
    }

    console.log('✅ Login successful!');
    console.log('User:', data.user.email);
    console.log('Role:', data.user.user_metadata?.role);
    console.log('User ID:', data.user.id);
    console.log('Full user metadata:', JSON.stringify(data.user.user_metadata, null, 2));
    
    // Test get user session
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log('❌ Get user failed:', userError.message);
    } else {
      console.log('✅ User session verified');
      console.log('Session user role:', userData.user?.user_metadata?.role);
    }

  } catch (err) {
    console.log('💥 Unexpected error:', err);
  }
}

await testAdminLogin();
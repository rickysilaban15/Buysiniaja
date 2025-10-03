import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const email = process.argv[2];
const password = process.argv[3];
const fullName = process.argv[4];

if (!email || !password || !fullName) {
  console.error("Usage: node createAdmin.js <email> <password> <fullName>");
  process.exit(1);
}

(async () => {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: 'admin' }
    });

    if (error) {
      console.error("Error creating admin:", error);
      return;
    }

    console.log(`✅ Admin created successfully: ${email}`);
    console.log(data);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
})();

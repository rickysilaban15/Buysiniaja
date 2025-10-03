import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error("Usage: node resetPassword.js <email> <newPassword>");
  process.exit(1);
}

(async () => {
  try {
    const { data, error: fetchError } = await supabase.auth.admin.listUsers();
    if (fetchError) throw fetchError;

    const users = data.users; // ambil array users
    const user = users.find(u => u.email === email);
    if (!user) {
      console.error("User not found");
      return;
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (error) {
      console.error("Error updating password:", error.message);
    } else {
      console.log(`✅ Password for ${email} updated successfully.`);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
})();

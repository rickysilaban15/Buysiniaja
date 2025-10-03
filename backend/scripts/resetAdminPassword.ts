import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
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
    // Cari user di tabel user_customers
    const { data: user, error: fetchError } = await supabase
      .from("user_customers")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !user) {
      console.error("User not found");
      return;
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password di tabel user_customers
    const { data, error } = await supabase
      .from('user_customers')
      .update({ password: hashedPassword })
      .eq("email", email);

    if (error) {
      console.error("Error updating password:", error.message);
    } else {
      console.log(`✅ Password for ${email} updated successfully.`);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
})();

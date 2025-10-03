// routes/admin.js
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // ← TAMBAHKAN INI

const router = express.Router();

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Environment check - URL:', supabaseUrl ? '✅' : '❌');
console.log('🔧 Environment check - Key:', serviceRoleKey ? '✅' : '❌');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

/* ------------------- ADMIN LOGIN ------------------- */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt received:', { email });
  
  if (!email || !password) {
    console.log('❌ Missing fields');
    return res.status(400).json({ success: false, error: "Email & password wajib diisi" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error || !data.user) {
      console.log('❌ Auth failed:', error?.message);
      return res.status(401).json({ success: false, error: "Email atau password salah" });
    }

    // Pastikan role admin
    const userRole = data.user.user_metadata?.role;
    console.log('🔍 User role:', userRole);
    
    if (userRole !== "admin") {
      console.log('❌ User is not admin');
      return res.status(403).json({ success: false, error: "Bukan akun admin" });
    }

    const token = jwt.sign(
      { 
        id: data.user.id, 
        email: data.user.email,
        role: userRole 
      },
      process.env.JWT_SECRET || 'fallback-secret', // ← tambah fallback
      { expiresIn: "24h" }
    );

    console.log('✅ Login successful for:', data.user.email);

    res.json({
      success: true,
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name,
        role: userRole
      }
    });
  } catch (err) {
    console.error('💥 Server error:', err);
    res.status(500).json({ success: false, error: "Terjadi kesalahan server" });
  }
});

export default router;
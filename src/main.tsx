// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StrictMode } from "react";
import supabase from './lib/supabase-client.js'; // STATIC IMPORT

console.log('🎯 Starting Buysini application...');

// Test Supabase connection langsung
supabase.from('products').select('id').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase test failed:', error);
    } else {
      console.log('✅ Supabase connected!');
    }
  })
  .catch(error => {
    console.error('💥 Supabase error:', error);
  });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

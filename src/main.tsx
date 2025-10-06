// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StrictMode } from "react";

console.log('🎯 Starting React application...')

// Load Supabase segera setelah aplikasi start
import('./lib/supabase-client')
  .then(() => {
    console.log('✅ Supabase pre-loaded successfully')
  })
  .catch((error) => {
    console.error('❌ Supabase pre-load failed:', error)
  })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

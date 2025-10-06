// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StrictMode } from "react";

console.log('🎯 Starting Buysini application...')

// Pre-load Supabase dan setup global exports
import('./lib/supabase-client')
  .then((module) => {
    console.log('✅ Supabase pre-loaded successfully')
    
    // Test connection
    return module.default.from('products').select('id').limit(1)
  })
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase test query failed:', error)
    } else {
      console.log('✅ Supabase test query successful')
    }
  })
  .catch((error) => {
    console.error('❌ Supabase pre-load failed:', error)
  })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import supabase untuk memastikan ter-load di awal
import supabase from "./lib/supabase";

console.log('🔧 Application starting...', {
  supabaseInitialized: !!supabase,
  hasWindow: typeof window !== 'undefined'
});

createRoot(document.getElementById("root")!).render(<App />);

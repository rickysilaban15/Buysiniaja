// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StrictMode } from "react";

console.log('🎯 Starting Buysini application...');

// Render aplikasi - Supabase akan tersedia via window.supabase
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
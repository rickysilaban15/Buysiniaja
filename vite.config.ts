import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false, // Disable sourcemaps untuk production
    minify: "esbuild",
    chunkSizeWarningLimit: 1000, // Increase warning limit
    rollupOptions: {
      output: {
        manualChunks: {
          // Pisahkan vendor libraries yang besar
          vendor: ["react", "react-dom"],
          ui: ["lucide-react"],
          // Pisahkan libraries PDF yang sangat besar
          pdf: ["jspdf", "html2canvas"],
          // Supabase
          supabase: ["@supabase/supabase-js"],
          // React Router
          router: ["react-router-dom"],
          // Utility libraries
          utils: ["date-fns", "lodash"]
        },
        // Optimasi chunk naming
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    }
  },
  // Optimasi untuk production
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : []
  }
}));
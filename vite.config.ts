import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  // ============================================
  // SPA Configuration for React Router
  // (Handles client-side routing in dev/preview)
  // ============================================
  server: {
    // Vite dev server: automatically falls back to index.html
    // for non-file routes (SPA routing)
    middlewareMode: false,
    host: "0.0.0.0",
    allowedHosts: [".e2b.app"],
  },

  preview: {
    // Preview server: test production build locally
    port: 4173,
    strictPort: false,
  },

  build: {
    target: "esnext",
    minify: "esbuild",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: { output: { manualChunks: { supabase: ['@supabase/supabase-js'] } } },
  },
  // ============================================
});

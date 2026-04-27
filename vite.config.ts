import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
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
  },

  preview: {
    // Preview server: test production build locally
    port: 4173,
    strictPort: false,
  },

  build: {
    target: "esnext",
    minify: "terser",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
  },
  // ============================================
});

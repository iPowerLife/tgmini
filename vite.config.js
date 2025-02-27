import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 3000,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "supabase-vendor": ["@supabase/supabase-js"],
        },
      },
    },
  },
  preview: {
    port: process.env.PORT || 3000,
    host: true,
  },
})


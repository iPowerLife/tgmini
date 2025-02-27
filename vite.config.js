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
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "supabase-vendor": ["@supabase/supabase-js"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@supabase/supabase-js"],
  },
})


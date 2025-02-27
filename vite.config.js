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
    minify: false, // Отключаем минификацию для отладки
    rollupOptions: {
      output: {
        manualChunks: null, // Отключаем разделение на чанки
      },
    },
  },
})


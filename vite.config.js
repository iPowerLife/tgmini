import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 3000,
    host: true,
  },
  preview: {
    port: process.env.PORT || 3000,
    host: true,
  },
  build: {
    // Включаем source maps для отладки
    sourcemap: true,
    // Добавляем информацию об ошибках
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})


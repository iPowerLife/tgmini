import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 3000,
    host: true, // Добавляем для работы в Railway
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    // Указываем точку входа явно
    rollupOptions: {
      input: "/index.html",
    },
  },
})


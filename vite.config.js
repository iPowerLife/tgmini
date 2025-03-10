import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true, // Генерировать полные sourcemap
    rollupOptions: {
      output: {
        manualChunks: {
          // Разделение кода на чанки для оптимизации
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["lucide-react"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
})


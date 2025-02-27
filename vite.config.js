import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: process.env.PORT || 3000,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    minify: false, // Отключаем минификацию для отладки
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})


import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 3000,
    host: true,
    cors: true,
  },
  preview: {
    port: process.env.PORT || 3000,
    host: true,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    allowedHosts: ["tgmini-production.up.railway.app", ".railway.app", "telegram.org", "telegram.me"],
  },
})


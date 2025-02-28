import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import App from "./App"

console.log("🚀 Starting application...")

const container = document.getElementById("root")

if (!container) {
  throw new Error("Root element not found!")
}

const root = createRoot(container)

console.log("📦 Root container found, rendering app...")

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)


import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import App from "./App"

console.log("🚀 Запуск приложения...")

const container = document.getElementById("root")
if (!container) {
  throw new Error("Элемент root не найден!")
}

const root = createRoot(container)
console.log("📦 Контейнер найден, рендерим приложение...")

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)


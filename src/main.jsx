import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import App from "./App"

// Добавляем глобальный обработчик ошибок
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global error:", { message, source, lineno, colno, error })
  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: #1a1b1e;
      color: white;
      padding: 20px;
      text-align: center;
    ">
      <div style="color: #ef4444; margin-bottom: 20px;">Произошла ошибка</div>
      <div style="color: #666;">${message}</div>
    </div>
  `
  return false
}

console.log("🚀 Starting application...")

try {
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
} catch (error) {
  console.error("Rendering error:", error)
  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: #1a1b1e;
      color: white;
      padding: 20px;
      text-align: center;
    ">
      <div style="color: #ef4444; margin-bottom: 20px;">Ошибка запуска</div>
      <div style="color: #666;">${error.message}</div>
    </div>
  `
}


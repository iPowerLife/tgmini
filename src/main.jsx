import { createRoot } from "react-dom/client"
import App from "./App.jsx"

// Отлавливаем глобальные ошибки
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global error:", { message, source, lineno, colno, error })
  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      background-color: #1a1b1e;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      text-align: center;
    ">
      <h1 style="color: #ff4444; margin-bottom: 20px;">Ошибка</h1>
      <div style="color: #666;">${message}</div>
    </div>
  `
}

try {
  console.log("Initializing app...")
  const container = document.getElementById("app")

  if (!container) {
    throw new Error("Root element #app not found")
  }

  console.log("Creating root...")
  const root = createRoot(container)

  console.log("Rendering app...")
  root.render(<App />)

  console.log("App rendered successfully")
} catch (error) {
  console.error("Failed to initialize app:", error)
  throw error
}


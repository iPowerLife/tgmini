import { createRoot } from "react-dom/client"
import App from "./App.jsx"

console.log("main.jsx: Starting initialization")

try {
  const container = document.getElementById("app")
  console.log("main.jsx: Container found:", !!container)

  if (!container) {
    throw new Error("Root element #app not found")
  }

  console.log("main.jsx: Creating root")
  const root = createRoot(container)

  console.log("main.jsx: Rendering app")
  root.render(<App />)

  console.log("main.jsx: Initial render complete")
} catch (error) {
  console.error("main.jsx: Initialization error:", error)

  // Показываем ошибку на странице
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
      <div style="color: #ff4444; margin-bottom: 20px;">
        Ошибка инициализации React
      </div>
      <div style="color: #666; font-size: 14px;">
        ${error.message}
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #666;">
        Проверьте консоль для дополнительной информации
      </div>
    </div>
  `
}


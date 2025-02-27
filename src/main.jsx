import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"

// Глобальный обработчик ошибок
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global error:", { message, source, lineno, colno, error })
  // Можно добавить отправку ошибок в систему мониторинга
}

const container = document.getElementById("app")
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


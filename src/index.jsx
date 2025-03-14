import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// Ждем загрузки Telegram WebApp перед рендерингом
function renderApp() {
  const root = ReactDOM.createRoot(document.getElementById("root"))
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

// Проверяем доступность Telegram WebApp
if (window.Telegram?.WebApp) {
  renderApp()
} else {
  // Если WebApp не доступен сразу, ждем событие загрузки
  window.addEventListener("load", () => {
    if (window.Telegram?.WebApp) {
      renderApp()
    } else {
      console.error("Telegram WebApp not available")
    }
  })
}


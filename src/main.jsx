import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"

// Инициализация Telegram WebApp
function initTelegramWebApp() {
  const tg = window.Telegram?.WebApp
  if (tg) {
    tg.ready()
    tg.expand()
    return true
  }
  return false
}

// Монтирование React приложения
function mountReactApp() {
  const container = document.getElementById("app")
  if (!container) {
    throw new Error("Root element #app not found")
  }

  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )

  return true
}

// Основная функция инициализации
function initialize() {
  console.log("Starting application initialization...")

  // Проверяем готовность Telegram WebApp
  if (!initTelegramWebApp()) {
    console.warn("Telegram WebApp not available, continuing anyway...")
  }

  // Монтируем React приложение
  try {
    mountReactApp()
    console.log("Application initialized successfully")
  } catch (error) {
    console.error("Failed to initialize application:", error)

    // Показываем ошибку на странице
    const container = document.getElementById("app")
    if (container) {
      container.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background-color: #1a1b1e;
          color: white;
        ">
          <div style="color: #ff4444;">Ошибка инициализации</div>
          <div style="color: #666; font-size: 14px;">${error.message}</div>
          <button onclick="window.location.reload()" style="
            padding: 10px 20px;
            background: #3b82f6;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
          ">
            Перезагрузить
          </button>
        </div>
      `
    }
  }
}

// Запускаем инициализацию после загрузки DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize)
} else {
  initialize()
}


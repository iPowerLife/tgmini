import React from "react"
import { createRoot } from "react-dom/client"

// Простой компонент для тестирования
function TestApp() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        padding: "20px",
        backgroundColor: "#1a1b1e",
        color: "white",
      }}
    >
      <h1>Telegram Mining Game</h1>
      <div>Тестовый компонент загружен</div>
    </div>
  )
}

// Оборачиваем монтирование в try-catch
try {
  console.log("Starting React initialization...")

  const container = document.getElementById("app")
  if (!container) {
    throw new Error("Root element #app not found")
  }

  console.log("Creating React root...")
  const root = createRoot(container)

  console.log("Rendering React app...")
  root.render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>,
  )

  console.log("React initialization complete")
} catch (error) {
  console.error("React initialization failed:", error)

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
        <div style="color: #ff4444;">Ошибка инициализации React</div>
        <div style="color: #666; font-size: 14px;">${error.message}</div>
      </div>
    `
  }
}


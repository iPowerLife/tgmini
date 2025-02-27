import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

// Отлавливаем ошибки при рендеринге
window.addEventListener("error", (event) => {
  console.error("Error in main.jsx:", event.error)
  if (document.getElementById("error-container")) {
    document.getElementById("error-container").innerHTML +=
      `[${new Date().toISOString()}] Ошибка рендеринга: ${event.error}\n`
  }
})

try {
  console.log("Starting React initialization...")
  ReactDOM.createRoot(document.getElementById("app")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  console.log("React initialization completed")
} catch (error) {
  console.error("Failed to initialize React:", error)
  if (document.getElementById("error-container")) {
    document.getElementById("error-container").innerHTML +=
      `[${new Date().toISOString()}] Ошибка инициализации React: ${error}\n`
  }
}


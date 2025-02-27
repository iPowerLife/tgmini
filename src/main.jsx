import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

// Добавляем базовые стили прямо здесь
const style = document.createElement("style")
style.textContent = `
  body, html {
    margin: 0;
    padding: 0;
    background-color: #1a1b1e !important;
    color: white !important;
    height: 100%;
  }
  #root {
    min-height: 100vh;
  }
`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


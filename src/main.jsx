import { createRoot } from "react-dom/client"
import App from "./App"
import "./styles.css" // Добавляем импорт стилей

const root = createRoot(document.getElementById("root"))
root.render(<App />)
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


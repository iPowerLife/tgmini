import ReactDOM from "react-dom/client"
import App from "./App"

// Создаем элемент если его нет
if (!document.getElementById("app")) {
  const app = document.createElement("div")
  app.id = "app"
  document.body.appendChild(app)
}

// Монтируем приложение
const root = ReactDOM.createRoot(document.getElementById("app"))
root.render(<App />)


import ReactDOM from "react-dom/client"
import App from "./App"

// Инициализируем Telegram WebApp сразу
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready()
  window.Telegram.WebApp.expand()
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />)


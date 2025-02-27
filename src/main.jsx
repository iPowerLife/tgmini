import ReactDOM from "react-dom/client"
import App from "./App"

// Проверяем, что элемент существует
const appElement = document.getElementById("app")
if (appElement) {
  console.log("Элемент #app найден")
  ReactDOM.createRoot(appElement).render(<App />)
} else {
  console.error("Элемент #app не найден!")
  // Создаем элемент, если его нет
  const newAppElement = document.createElement("div")
  newAppElement.id = "app"
  document.body.appendChild(newAppElement)
  console.log("Создан новый элемент #app")
  ReactDOM.createRoot(newAppElement).render(<App />)
}


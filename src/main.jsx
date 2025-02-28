import { createRoot } from "react-dom/client"
import App from "./App"

console.log("🚀 Запуск приложения...")

const container = document.getElementById("root")
if (!container) {
  console.error("❌ Элемент root не найден!")
  throw new Error("Элемент root не найден!")
}

try {
  console.log("📦 Создаем root...")
  const root = createRoot(container)

  console.log("🎨 Рендерим приложение...")
  root.render(<App />)

  console.log("✅ Приложение запущено!")
} catch (error) {
  console.error("❌ Ошибка рендеринга:", error)
  container.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: #1a1b1e;
      color: white;
      padding: 20px;
      text-align: center;
    ">
      <div style="color: #ef4444; margin-bottom: 20px;">Ошибка запуска</div>
      <div style="color: #666;">${error.message}</div>
    </div>
  `
}


import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"

// Перехватчик ошибок
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("React error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#1a1b1e",
            color: "white",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <h1>Что-то пошло не так 😢</h1>
          <div
            style={{
              margin: "20px",
              padding: "20px",
              backgroundColor: "#ff44441a",
              borderRadius: "8px",
              maxWidth: "80%",
            }}
          >
            {this.state.error?.message || "Неизвестная ошибка"}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Перезагрузить страницу
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Глобальный обработчик ошибок
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global error:", { message, source, lineno, colno, error })
}

const container = document.getElementById("app")
if (!container) {
  throw new Error("Root element #app not found")
}

const root = createRoot(container)

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)


"use client"

import { useEffect } from "react"

import { useState } from "react"

import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import App from "./App"

const container = document.getElementById("root")

if (!container) {
  throw new Error("Root element not found!")
}

const root = createRoot(container)

try {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (error) {
  console.error("Rendering error:", error)
  container.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
      text-align: center;
      color: white;
    ">
      <h1 style="color: #ef4444; margin-bottom: 20px;">Ошибка</h1>
      <p>${error.message}</p>
    </div>
  `
}

// Error Boundary Component
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error("Global error:", { message, source, lineno, colno, error })
      setHasError(true)
      setError(error)
      return false
    }

    return () => {
      window.onerror = null
    }
  }, [])

  if (hasError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          textAlign: "center",
          color: "white",
        }}
      >
        <h1 style={{ color: "#ef4444", marginBottom: "20px" }}>Что-то пошло не так</h1>
        <p>{error?.message || "Произошла неизвестная ошибка"}</p>
      </div>
    )
  }

  return children
}


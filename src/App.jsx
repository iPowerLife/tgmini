"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { LoadingScreen } from "./components/LoadingScreen"

// Простой компонент для начала
export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Проверяем подключение к Supabase
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error

        console.log("Supabase connection successful")
        setIsLoading(false)
      } catch (err) {
        console.error("Initialization error:", err)
        setError(err.message)
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  if (isLoading) {
    return <LoadingScreen message="Загрузка приложения..." />
  }

  if (error) {
    return <LoadingScreen error={error} />
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>Приложение работает!</h1>
      <p>Если вы видите это сообщение, значит основной рендеринг успешен.</p>
    </div>
  )
}


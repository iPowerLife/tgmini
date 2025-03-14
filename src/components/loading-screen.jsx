"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function LoadingScreen() {
  const [loadingText, setLoadingText] = useState("Подключение к серверу")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let mounted = true
    let progressInterval

    const checkConnection = async () => {
      try {
        // Проверяем соединение с Supabase
        const { error } = await supabase.from("users").select("id").limit(1)

        if (mounted) {
          if (error) {
            setLoadingText("Ошибка подключения к серверу")
          } else {
            setLoadingText("Загрузка данных")
            setProgress(30)

            // Имитируем загрузку данных
            progressInterval = setInterval(() => {
              setProgress((prev) => {
                const newProgress = prev + Math.floor(Math.random() * 10)
                if (newProgress >= 100) {
                  clearInterval(progressInterval)
                  return 100
                }
                return newProgress
              })
            }, 300)
          }
        }
      } catch (error) {
        console.error("Ошибка при проверке соединения:", error)
        if (mounted) {
          setLoadingText("Ошибка подключения к серверу")
        }
      }
    }

    checkConnection()

    return () => {
      mounted = false
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#1A1F2E] z-50">
      <div className="text-center px-4 max-w-md">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6 mx-auto"></div>

        <h2 className="text-xl font-semibold text-white mb-2">Загрузка игры</h2>
        <p className="text-gray-400 mb-4">{loadingText}...</p>

        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-xs text-gray-500">{progress}%</p>
      </div>
    </div>
  )
}


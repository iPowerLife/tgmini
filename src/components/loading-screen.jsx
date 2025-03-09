"use client"

import { useState, useEffect } from "react"

export default function LoadingScreen({ isLoading, loadingSteps, progress, onAnimationComplete }) {
  const [fadeOut, setFadeOut] = useState(false)

  // Функция для получения статуса шага загрузки
  const getStepStatus = (step) => {
    const status = loadingSteps[step]
    if (status === "complete") return "✓"
    if (status === "loading") return "⟳"
    if (status === "error") return "✗"
    return "•"
  }

  // Функция для получения класса статуса шага загрузки
  const getStepStatusClass = (step) => {
    const status = loadingSteps[step]
    if (status === "complete") return "text-green-500"
    if (status === "loading") return "text-blue-500 animate-spin"
    if (status === "error") return "text-red-500"
    return "text-gray-400"
  }

  // Эффект для обработки завершения загрузки
  useEffect(() => {
    let timeoutId

    if (progress >= 100 && !fadeOut) {
      console.log("Progress is 100%, starting fade out sequence")
      timeoutId = setTimeout(() => {
        console.log("Starting fade out animation")
        setFadeOut(true)
      }, 1000)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [progress, fadeOut])

  // Эффект для вызова onAnimationComplete
  useEffect(() => {
    let timeoutId

    if (fadeOut) {
      console.log("Fade out active, preparing to complete")
      timeoutId = setTimeout(() => {
        console.log("Calling onAnimationComplete")
        onAnimationComplete?.()
      }, 500)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [fadeOut, onAnimationComplete])

  // Если загрузка завершена и анимация исчезновения закончилась, не рендерим ничего
  if (!isLoading && fadeOut) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 bg-[#1A1F2E] flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Загрузка</h1>
          <p className="text-gray-400">Подготавливаем приложение...</p>
        </div>

        <div className="mb-6">
          <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="text-right mt-1 text-gray-400 text-sm">{Math.round(progress)}%</div>
        </div>

        <div className="space-y-3">
          {Object.entries(loadingSteps).map(([step, status]) => (
            <div key={step} className="flex items-center">
              <span className={`w-6 h-6 flex items-center justify-center ${getStepStatusClass(step)}`}>
                {getStepStatus(step)}
              </span>
              <span className="ml-2 text-white">
                {step === "database" && "Подключение к базе данных"}
                {step === "user" && "Загрузка данных пользователя"}
                {step === "miners" && "Загрузка майнеров"}
                {step === "tasks" && "Загрузка заданий"}
                {step === "mining" && "Загрузка данных майнинга"}
                {step === "images" && "Загрузка изображений"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


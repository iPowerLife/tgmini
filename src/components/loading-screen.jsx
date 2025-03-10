"use client"

import { useState, useEffect } from "react"

export default function LoadingScreen({ isLoading, loadingSteps, progress, onAnimationComplete }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Когда прогресс достигает 100%, начинаем анимацию исчезновения
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setFadeOut(true)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [progress])

  useEffect(() => {
    // Когда анимация исчезновения завершена, вызываем колбэк
    if (fadeOut) {
      const timer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete()
        }
      }, 500) // Время анимации fadeOut

      return () => clearTimeout(timer)
    }
  }, [fadeOut, onAnimationComplete])

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

  // Функция для получения детализированного описания шага загрузки
  const getStepDetail = (step) => {
    const status = loadingSteps[step]
    if (step === "images") {
      if (status === "loading") return "Загрузка изображений майнеров и заданий..."
      if (status === "complete") return "Изображения загружены!"
      if (status === "error") return "Ошибка загрузки некоторых изображений"
    }
    if (step === "miners") {
      if (status === "loading") return "Загрузка данных о майнерах..."
      if (status === "complete") return "Данные майнеров загружены!"
      if (status === "error") return "Ошибка загрузки данных майнеров"
    }
    return ""
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
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-right mt-1 text-gray-400 text-sm">{Math.round(progress)}%</div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <span className={`w-6 h-6 flex items-center justify-center ${getStepStatusClass("database")}`}>
              {getStepStatus("database")}
            </span>
            <span className="ml-2 text-white">Подключение к базе данных</span>
          </div>
          <div className="flex items-center">
            <span className={`w-6 h-6 flex items-center justify-center ${getStepStatusClass("user")}`}>
              {getStepStatus("user")}
            </span>
            <span className="ml-2 text-white">Загрузка данных пользователя</span>
          </div>
          <div className="flex items-center">
            <span className={`w-6 h-6 flex items-center justify-center ${getStepStatusClass("miners")}`}>
              {getStepStatus("miners")}
            </span>
            <div className="ml-2">
              <span className="text-white">Загрузка майнеров</span>
              {loadingSteps["miners"] === "loading" && (
                <p className="text-xs text-gray-400">{getStepDetail("miners")}</p>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <span className={`w-6 h-6 flex items-center justify-center ${getStepStatusClass("tasks")}`}>
              {getStepStatus("tasks")}
            </span>
            <span className="ml-2 text-white">Загрузка заданий</span>
          </div>
          <div className="flex items-center">
            <span className={`w-6 h-6 flex items-center justify-center ${getStepStatusClass("mining")}`}>
              {getStepStatus("mining")}
            </span>
            <span className="ml-2 text-white">Загрузка данных майнинга</span>
          </div>
          <div className="flex items-center">
            <span className={`w-6 h-6 flex items-center justify-center ${getStepStatusClass("images")}`}>
              {getStepStatus("images")}
            </span>
            <div className="ml-2">
              <span className="text-white">Загрузка изображений</span>
              {loadingSteps["images"] === "loading" && (
                <p className="text-xs text-gray-400">{getStepDetail("images")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


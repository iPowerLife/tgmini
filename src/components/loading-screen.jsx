"use client"

import { useEffect } from "react"
import { Loader, CheckCircle, XCircle } from "lucide-react"

export const LoadingScreen = ({ isLoading, loadingSteps, progress, onAnimationComplete }) => {
  // Преобразуем объект loadingSteps в массив для отображения
  const stepsArray = Object.entries(loadingSteps).map(([key, value]) => ({
    id: key,
    status: value,
    name: getStepName(key),
  }))

  // Функция для получения понятного названия шага
  function getStepName(stepId) {
    const names = {
      database: "Подключение к базе данных",
      user: "Загрузка профиля",
      miners: "Загрузка майнеров",
      mining: "Загрузка данных майнинга",
    }
    return names[stepId] || stepId
  }

  // Эффект для завершения анимации загрузки
  useEffect(() => {
    if (progress >= 100 && !isLoading) {
      // Небольшая задержка перед скрытием загрузочного экрана
      const timer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete()
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [progress, isLoading, onAnimationComplete])

  return (
    <div className="fixed inset-0 bg-[#0B1622] flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Загрузка приложения</h1>
          <p className="text-gray-400">Пожалуйста, подождите, пока мы подготовим все необходимое</p>
        </div>

        {/* Прогресс-бар */}
        <div className="w-full bg-gray-800 rounded-full h-2.5 mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Список шагов загрузки */}
        <div className="space-y-3 mb-8">
          {stepsArray.map((step) => (
            <div key={step.id} className="flex items-center">
              <div className="w-8 h-8 flex-shrink-0 mr-3">
                {step.status === "loading" ? (
                  <Loader size={20} className="text-blue-500 animate-spin" />
                ) : step.status === "complete" ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : step.status === "error" ? (
                  <XCircle size={20} className="text-red-500" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>
                )}
              </div>
              <div
                className={`flex-1 ${
                  step.status === "loading"
                    ? "text-white"
                    : step.status === "complete"
                      ? "text-gray-400"
                      : step.status === "error"
                        ? "text-red-400"
                        : "text-gray-600"
                }`}
              >
                {step.name}
              </div>
            </div>
          ))}
        </div>

        {/* Текущий статус */}
        <div className="text-center text-sm text-gray-400">
          {progress < 100 ? <span>Загружено {progress}%</span> : <span>Загрузка завершена! Запуск приложения...</span>}
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen


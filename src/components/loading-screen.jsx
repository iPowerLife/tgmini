"use client"

import { useState, useEffect } from "react"
import { Loader, CheckCircle, XCircle } from "lucide-react"

export const LoadingScreen = ({ onComplete, loadingSteps }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepStatus, setStepStatus] = useState({})
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      const totalSteps = loadingSteps.length

      for (let i = 0; i < totalSteps; i++) {
        const step = loadingSteps[i]
        setCurrentStep(i)

        try {
          setStepStatus((prev) => ({ ...prev, [i]: "loading" }))
          await step.action()
          setStepStatus((prev) => ({ ...prev, [i]: "success" }))
        } catch (error) {
          console.error(`Error in loading step ${i}:`, error)
          setStepStatus((prev) => ({ ...prev, [i]: "error" }))
        }

        // Обновляем прогресс
        setProgress(Math.round(((i + 1) / totalSteps) * 100))
      }

      // Задержка перед завершением, чтобы пользователь увидел 100%
      setTimeout(() => {
        onComplete()
      }, 500)
    }

    loadData()
  }, [loadingSteps, onComplete])

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
          {loadingSteps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="w-8 h-8 flex-shrink-0 mr-3">
                {stepStatus[index] === "loading" ? (
                  <Loader size={20} className="text-blue-500 animate-spin" />
                ) : stepStatus[index] === "success" ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : stepStatus[index] === "error" ? (
                  <XCircle size={20} className="text-red-500" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>
                )}
              </div>
              <div
                className={`flex-1 ${currentStep === index ? "text-white" : currentStep > index ? "text-gray-400" : "text-gray-600"}`}
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


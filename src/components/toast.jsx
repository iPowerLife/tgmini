"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

export function Toast({ message, type = "info", onClose, duration = 5000 }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        onClose && onClose()
      }, 300) // Задержка для анимации
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100 dark:bg-green-900/30"
      case "error":
        return "bg-red-100 dark:bg-red-900/30"
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900/30"
      case "info":
      default:
        return "bg-blue-100 dark:bg-blue-900/30"
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-green-500"
      case "error":
        return "border-red-500"
      case "warning":
        return "border-yellow-500"
      case "info":
      default:
        return "border-blue-500"
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`flex items-center p-4 rounded-lg shadow-md border-l-4 ${getBackgroundColor()} ${getBorderColor()}`}
      >
        <div className="mr-3">{getIcon()}</div>
        <div className="mr-2 text-sm font-medium text-gray-900 dark:text-gray-100">{message}</div>
        <button
          onClick={() => {
            setVisible(false)
            setTimeout(() => {
              onClose && onClose()
            }, 300)
          }}
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-900 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function TestPage() {
  const [status, setStatus] = useState("Проверка подключения...")
  const [results, setResults] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  async function testConnection() {
    try {
      setStatus("Начинаем проверку...")

      // Проверка подключения к Supabase
      const { data: testData, error: testError } = await supabase.from("users").select("count(*)", { count: "exact" })

      if (testError) throw testError

      setResults((prev) => ({
        ...prev,
        dbConnection: "Успешно",
        usersCount: testData[0].count,
      }))

      // Проверка таблиц
      const tables = ["miners", "user_miners", "transactions", "levels"]
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select("count(*)", { count: "exact" })

        if (error) throw error

        setResults((prev) => ({
          ...prev,
          [table]: data[0].count,
        }))
      }

      setStatus("Все проверки завершены успешно!")
    } catch (error) {
      console.error("Error testing connection:", error)
      setError(error.message)
      setStatus("Произошла ошибка при проверке")
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-4">Тест подключения к Supabase</h1>

      {/* Статус */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="font-medium">Статус:</div>
        <div className={error ? "text-red-500" : "text-green-500"}>{status}</div>
        {error && <div className="text-red-500 text-sm mt-2">Ошибка: {error}</div>}
      </div>

      {/* Результаты */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="font-medium mb-2">Результаты проверки:</div>
        <div className="grid gap-2">
          <div className="flex justify-between">
            <span>Подключение к БД:</span>
            <span className="text-green-500">{results.dbConnection || "Проверка..."}</span>
          </div>
          <div className="flex justify-between">
            <span>Количество пользователей:</span>
            <span>{results.usersCount || "..."}</span>
          </div>
          <div className="flex justify-between">
            <span>Майнеры:</span>
            <span>{results.miners || "..."}</span>
          </div>
          <div className="flex justify-between">
            <span>Инвентарь пользователей:</span>
            <span>{results.user_miners || "..."}</span>
          </div>
          <div className="flex justify-between">
            <span>Транзакции:</span>
            <span>{results.transactions || "..."}</span>
          </div>
          <div className="flex justify-between">
            <span>Уровни:</span>
            <span>{results.levels || "..."}</span>
          </div>
        </div>
      </div>

      {/* Кнопка повторной проверки */}
      <button
        onClick={testConnection}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Проверить снова
      </button>
    </div>
  )
}


import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://tphsnmoitxericjvgwwn.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHNubW9pdHhlcmljanZnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjI3NDEsImV4cCI6MjA1NjE5ODc0MX0.ZArqTk-yG6PFaVQmSaoymvyGXF3McWhmPC7MePYK_lQ"

// Создаем клиент с минимальной конфигурацией
export const supabase = createClient(supabaseUrl, supabaseKey)

// Функция для проверки подключения
export async function checkSupabaseConnection() {
  console.log("=== Начало проверки подключения к Supabase ===")

  try {
    // Проверяем простой запрос без RLS
    console.log("Пробуем выполнить простой запрос...")
    const { data, error } = await supabase.from("users").select("*").limit(1).single()

    if (error) {
      console.error("Ошибка при запросе:", error)
      console.error("Код ошибки:", error.code)
      console.error("Сообщение:", error.message)
      console.error("Детали:", error.details)
      return false
    }

    console.log("Запрос выполнен успешно!")
    console.log("Данные получены:", data)
    return true
  } catch (error) {
    console.error("=== Критическая ошибка при проверке подключения ===")
    console.error("Тип ошибки:", error.name)
    console.error("Сообщение:", error.message)
    console.error("Стек вызовов:", error.stack)
    return false
  }
}

// Функция для тестового запроса
export async function testDatabaseAccess() {
  console.log("=== Тестирование доступа к базе данных ===")

  try {
    // Тест 1: Проверка соединения
    console.log("Тест 1: Проверка соединения")
    const { data: healthCheck } = await supabase.rpc("version")
    console.log("Версия базы данных:", healthCheck)

    // Тест 2: Проверка чтения
    console.log("Тест 2: Проверка чтения")
    const { data: readData, error: readError } = await supabase.from("users").select("count").limit(1)

    if (readError) {
      throw new Error(`Ошибка чтения: ${readError.message}`)
    }
    console.log("Чтение успешно:", readData)

    // Тест 3: Проверка записи
    console.log("Тест 3: Проверка записи")
    const testUser = {
      telegram_id: Date.now(),
      first_name: "Test User",
      balance: 0,
      mining_power: 1,
      level: 1,
      experience: 0,
      next_level_exp: 100,
    }

    const { data: writeData, error: writeError } = await supabase.from("users").insert([testUser]).select()

    if (writeError) {
      throw new Error(`Ошибка записи: ${writeError.message}`)
    }
    console.log("Запись успешна:", writeData)

    return true
  } catch (error) {
    console.error("Ошибка при тестировании:", error)
    return false
  }
}


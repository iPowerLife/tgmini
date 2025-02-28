import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://tphsnmoitxericjvgwwn.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHNubW9pdHhlcmljanZnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjI3NDEsImV4cCI6MjA1NjE5ODc0MX0.ZArqTk-yG6PFaVQmSaoymvyGXF3McWhmPC7MePYK_lQ"

// Создаем клиент Supabase с базовыми настройками
export const supabase = createClient(supabaseUrl, supabaseKey)

// Функция для проверки подключения
export async function checkSupabaseConnection() {
  console.log("Начинаем проверку подключения к базе данных...")

  try {
    // Используем простой select без count
    const { data, error } = await supabase.from("users").select("id").limit(1)

    if (error) {
      console.error("Детали ошибки подключения:", {
        код: error.code,
        сообщение: error.message,
        детали: error.details,
        подсказка: error.hint,
      })
      return false
    }

    console.log("Подключение успешно установлено")
    return true
  } catch (error) {
    console.error("Критическая ошибка при подключении:", error.message)
    return false
  }
}

// Функция для создания тестового пользователя
export async function createTestUser() {
  try {
    const testUser = {
      telegram_id: 999999,
      first_name: "Тестовый пользователь",
      balance: 0,
      mining_power: 1,
      level: 1,
      experience: 0,
      next_level_exp: 100,
    }

    // Простая проверка существования
    const { data: existing } = await supabase.from("users").select("id").eq("telegram_id", 999999).single()

    // Если пользователь существует, возвращаем его
    if (existing) {
      return existing
    }

    // Создаем нового пользователя
    const { data, error } = await supabase.from("users").insert([testUser]).select().single()

    if (error) {
      console.error("Ошибка при создании тестового пользователя:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Ошибка:", error.message)
    return null
  }
}

// Функция для тестового запроса
export async function testDatabaseAccess() {
  console.log("=== Тестирование доступа к базе данных ===")

  try {
    // Простой тест чтения
    const { data, error } = await supabase.from("users").select("id").limit(1)

    if (error) {
      throw new Error(`Ошибка чтения: ${error.message}`)
    }

    console.log("Тест чтения успешен")
    return true
  } catch (error) {
    console.error("Ошибка при тестировании:", error)
    return false
  }
}


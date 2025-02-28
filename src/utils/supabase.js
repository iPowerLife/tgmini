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
    // Используем limit(1) вместо maybeSingle()
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

    // Проверяем, что мы получили массив (даже пустой)
    if (!Array.isArray(data)) {
      console.error("Неожиданный формат данных:", data)
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
    // Проверяем, существует ли уже тестовый пользователь
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select()
      .eq("telegram_id", 999999)
      .limit(1)

    if (checkError) {
      console.error("Ошибка при проверке существующего пользователя:", checkError)
      return null
    }

    // Если тестовый пользователь уже существует, возвращаем его
    if (existingUser && existingUser.length > 0) {
      return existingUser[0]
    }

    // Создаем нового тестового пользователя
    const testUser = {
      telegram_id: 999999,
      first_name: "Тестовый пользователь",
      balance: 0,
      mining_power: 1,
      level: 1,
      experience: 0,
      next_level_exp: 100,
    }

    const { data, error } = await supabase.from("users").insert([testUser]).select()

    if (error) {
      console.error("Ошибка при создании тестового пользователя:", error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Ошибка:", error.message)
    return null
  }
}

// Функция для тестового запроса
export async function testDatabaseAccess() {
  console.log("=== Тестирование доступа к базе данных ===")

  try {
    // Тест 1: Проверка чтения
    console.log("Тест 1: Проверка чтения")
    const { data: readData, error: readError } = await supabase.from("users").select("telegram_id").limit(1)

    if (readError) {
      throw new Error(`Ошибка чтения: ${readError.message}`)
    }
    console.log("Чтение успешно:", readData)

    return true
  } catch (error) {
    console.error("Ошибка при тестировании:", error)
    return false
  }
}


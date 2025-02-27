import { createClient } from "@supabase/supabase-js"

// Проверяем наличие переменных окружения перед созданием клиента
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:", {
    url: supabaseUrl ? "✓" : "✗",
    key: supabaseAnonKey ? "✓" : "✗",
  })
  throw new Error("Missing required environment variables")
}

// Создаем клиента Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Функция для тестирования подключения
export async function testConnection() {
  const steps = {
    connection: false,
    usersTable: false,
    levelsTable: false,
    transactionsTable: false,
  }

  try {
    // Проверяем подключение к Supabase
    const { error: healthCheck } = await supabase.from("users").select("count", { count: "exact", head: true })

    if (healthCheck) {
      console.error("Health check failed:", healthCheck)
      return {
        success: false,
        steps,
        error: `Ошибка подключения: ${healthCheck.message}`,
      }
    }

    steps.connection = true

    // Проверяем таблицы по очереди
    const tables = ["users", "levels", "transactions"]
    for (const table of tables) {
      const { error } = await supabase.from(table).select("id").limit(1)

      if (error) {
        console.error(`Error checking ${table}:`, error)
        return {
          success: false,
          steps,
          error: `Ошибка доступа к таблице ${table}: ${error.message}`,
        }
      }

      steps[`${table}Table`] = true
    }

    return {
      success: true,
      steps,
      error: null,
    }
  } catch (err) {
    console.error("Test connection failed:", err)
    return {
      success: false,
      steps,
      error: err.message,
    }
  }
}


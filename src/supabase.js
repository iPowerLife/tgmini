import { createClient } from "@supabase/supabase-js"

// Проверяем наличие переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("⚠️ Missing Supabase environment variables!")
  console.log("VITE_SUPABASE_URL:", supabaseUrl ? "✓" : "✗")
  console.log("VITE_SUPABASE_ANON_KEY:", supabaseKey ? "✓" : "✗")
}

// Создаем клиент с дополнительными опциями
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      "x-application-name": "telegram-mining-game",
    },
  },
  db: {
    schema: "public",
  },
  // Добавляем retry логику
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Функция для проверки подключения с retry логикой
export async function testConnection(maxRetries = 3) {
  let retries = 0

  while (retries < maxRetries) {
    try {
      const { data, error } = await supabase.from("users").select("count").single()

      if (error) {
        throw error
      }

      console.log("✅ Supabase connection successful")
      return true
    } catch (error) {
      console.error(`❌ Attempt ${retries + 1}/${maxRetries} failed:`, error.message)
      retries++

      if (retries === maxRetries) {
        console.error("🚫 All connection attempts failed")
        return false
      }

      // Ждем перед следующей попыткой (увеличиваем время с каждой попыткой)
      await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
    }
  }

  return false
}

// Проверяем подключение при инициализации
testConnection().then((isConnected) => {
  if (!isConnected) {
    console.error("🚫 Failed to establish Supabase connection")
  }
})


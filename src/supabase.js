import { createClient } from "@supabase/supabase-js"

console.log("📡 Инициализация Supabase...")

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Отсутствуют переменные окружения Supabase!")
  console.log("VITE_SUPABASE_URL:", supabaseUrl ? "✓" : "✗")
  console.log("VITE_SUPABASE_ANON_KEY:", supabaseKey ? "✓" : "✗")
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
})

// Проверяем подключение
supabase
  .from("users")
  .select("count")
  .single()
  .then(({ data, error }) => {
    if (error) {
      console.error("❌ Ошибка подключения к Supabase:", error)
    } else {
      console.log("✅ Подключение к Supabase успешно")
    }
  })


import { createClient } from "@supabase/supabase-js"

// Проверяем наличие переменных окружения перед созданием клиента
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase environment variables are missing, using default values")
}

// Создаем клиент Supabase с дополнительными опциями
export const supabase = createClient(
  supabaseUrl || "https://tphsnmoitxericjvgwwn.supabase.co",
  supabaseKey ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHNubW9pdHhlcmljanZnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjI3NDEsImV4cCI6MjA1NjE5ODc0MX0.ZArqTk-yG6PFaVQmSaoymvyGXF3McWhmPC7MePYK_lQ",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
)

// Тестируем подключение
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Supabase connection error:", error)
  } else {
    console.log("Supabase connected successfully")
  }
})


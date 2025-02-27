import { createClient } from "@supabase/supabase-js"

// Проверяем наличие переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables!")
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Проверяем подключение
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Supabase connection error:", error)
  } else {
    console.log("Supabase connected successfully")
  }
})


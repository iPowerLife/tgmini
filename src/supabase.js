import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://tphsnmoitxericjvgwwn.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHNubW9pdHhlcmljanZnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjI3NDEsImV4cCI6MjA1NjE5ODc0MX0.ZArqTk-yG6PFaVQmSaoymvyGXF3McWhmPC7MePYK_lQ"

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },
})

// Добавляем функцию для проверки подключения
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count(*)", { count: "exact" }).limit(0)

    if (error) {
      console.error("Ошибка подключения к Supabase:", error)
      return false
    }

    console.log("Подключение к Supabase успешно")
    return true
  } catch (error) {
    console.error("Критическая ошибка при подключении к Supabase:", error)
    return false
  }
}


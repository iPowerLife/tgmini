import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables:", {
    url: !!supabaseUrl,
    key: !!supabaseKey,
  })
  throw new Error("Missing required environment variables")
}

console.log("Initializing Supabase with URL:", supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: "public",
  },
})

// Тестовая функция для проверки подключения
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count", { count: "exact", head: true })

    if (error) {
      console.error("Supabase connection test failed:", error)
      return false
    }

    console.log("Supabase connection test successful:", data)
    return true
  } catch (error) {
    console.error("Supabase connection test error:", error)
    return false
  }
}


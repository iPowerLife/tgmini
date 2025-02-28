import { createClient } from "@supabase/supabase-js"

console.log("📡 Initializing Supabase...")

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables!")
  throw new Error("Необходимо указать VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в файле .env")
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
})

// Функция для проверки подключения
export async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.from("users").select("count").single()
      if (error) throw error
      console.log("✅ Supabase connection successful")
      return true
    } catch (error) {
      console.error(`❌ Connection attempt ${i + 1}/${retries} failed:`, error.message)
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }
  return false
}


import { createClient } from "@supabase/supabase-js"

console.log("📡 Initializing Supabase with env vars:", {
  url: import.meta.env.VITE_SUPABASE_URL ? "✓" : "✗",
  key: import.meta.env.VITE_SUPABASE_ANON_KEY ? "✓" : "✗",
})

// Проверяем наличие переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables! Check your .env file.")
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
})


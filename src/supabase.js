import { createClient } from "@supabase/supabase-js"

console.log("📡 Initializing Supabase...")

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables!")
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

// Проверяем подключение при инициализации
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("❌ Supabase connection error:", error)
  } else {
    console.log("✅ Supabase initialized successfully")
  }
})


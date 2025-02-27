import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables!")
  console.log("VITE_SUPABASE_URL:", supabaseUrl)
  console.log("VITE_SUPABASE_ANON_KEY:", supabaseKey ? "exists" : "missing")
}

export const supabase = createClient(supabaseUrl || "https://your-project.supabase.co", supabaseKey || "your-anon-key")

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Supabase connection error:", error)
  } else {
    console.log("Supabase connected successfully")
  }
})


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

// Тестовая функция для проверки подключения и данных
export async function testSupabaseConnection() {
  try {
    console.log("Testing Supabase connection...")

    // Проверяем подключение к базе данных
    const { data: userCount, error: userError } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true })

    if (userError) {
      console.error("Error checking users:", userError)
      return false
    }

    console.log("Users count:", userCount)

    // Проверяем таблицу достижений
    const { data: achievements, error: achievementsError } = await supabase.from("achievements").select("*")

    if (achievementsError) {
      console.error("Error checking achievements:", achievementsError)
    } else {
      console.log("Achievements count:", achievements?.length)
      console.log("Achievements data:", achievements)
    }

    // Проверяем таблицу предметов магазина
    const { data: shopItems, error: shopError } = await supabase.from("shop_items").select("*")

    if (shopError) {
      console.error("Error checking shop items:", shopError)
    } else {
      console.log("Shop items count:", shopItems?.length)
      console.log("Shop items data:", shopItems)
    }

    return true
  } catch (error) {
    console.error("Supabase connection test error:", error)
    return false
  }
}


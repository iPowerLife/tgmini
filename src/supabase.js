import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://tphsnmoitxericjvgwwn.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHNubW9pdHhlcmljanZnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjI3NDEsImV4cCI6MjA1NjE5ODc0MX0.ZArqTk-yG6PFaVQmSaoymvyGXF3McWhmPC7MePYK_lQ"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Функция для проверки подключения к базе данных
export async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count(*)", { count: "exact" })

    if (error) throw error

    console.log("Database connection successful")
    return true
  } catch (err) {
    console.error("Database connection error:", err)
    return false
  }
}

// Функция для создания пользователя
export async function createUser(telegramId, username) {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          telegram_id: telegramId,
          username: username,
          balance: 0,
          mining_power: 1,
          level: 1,
          experience: 0,
          next_level_exp: 100,
        },
      ])
      .select()
      .single()

    if (error) throw error

    console.log("User created successfully:", data)
    return data
  } catch (err) {
    console.error("Error creating user:", err)
    throw err
  }
}

// Функция для получения данных пользователя
export async function getUserData(telegramId) {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

    if (error) throw error

    console.log("User data retrieved:", data)
    return data
  } catch (err) {
    console.error("Error getting user data:", err)
    throw err
  }
}


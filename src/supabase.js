import { createClient } from "@supabase/supabase-js"

// Используем service role для полного доступа к базе данных
const supabaseUrl = "https://tphsnmoitxericjvgwwn.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHNubW9pdHhlcmljanZnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDYyMjc0MSwiZXhwIjoyMDU2MTk4NzQxfQ.FcXliEXtiyJcnLX6xFaSSZLSYtyD9JeLQ4mdOCLR1f4"

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Функция для проверки подключения к базе данных
export async function checkDatabaseConnection() {
  try {
    console.log("Checking database connection...")
    const { data, error } = await supabase.from("users").select("count(*)", { count: "exact", head: true })

    if (error) {
      console.error("Database connection error:", error)
      throw error
    }

    console.log("Database connection successful")
    return true
  } catch (err) {
    console.error("Database connection check failed:", err)
    return false
  }
}

// Функция для инициализации базы данных
export async function initializeDatabase() {
  try {
    console.log("Initializing database...")

    // Проверяем существование таблицы users
    const { error: usersError } = await supabase.from("users").select("id").limit(1)

    if (usersError) {
      console.log("Creating users table...")
      await supabase.rpc("initialize_database")
    }

    // Проверяем существование таблицы levels
    const { error: levelsError } = await supabase.from("levels").select("level").limit(1)

    if (levelsError) {
      console.log("Initializing levels...")
      await supabase.from("levels").insert([
        { level: 1, exp_required: 0, reward: 0, description: "Новичок" },
        { level: 2, exp_required: 100, reward: 50, description: "Начинающий майнер" },
        { level: 3, exp_required: 300, reward: 100, description: "Опытный майнер" },
        { level: 4, exp_required: 600, reward: 200, description: "Продвинутый майнер" },
        { level: 5, exp_required: 1000, reward: 300, description: "Профессиональный майнер" },
      ])
    }

    console.log("Database initialization completed")
    return true
  } catch (err) {
    console.error("Database initialization failed:", err)
    return false
  }
}

// Функция для создания пользователя
export async function createUser(telegramId, username) {
  try {
    console.log("Creating new user:", { telegramId, username })
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

    if (error) {
      console.error("Error creating user:", error)
      throw error
    }

    console.log("User created successfully:", data)
    return data
  } catch (err) {
    console.error("User creation failed:", err)
    throw err
  }
}

// Функция для получения данных пользователя
export async function getUserData(telegramId) {
  try {
    console.log("Getting user data for:", telegramId)
    const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

    if (error) {
      console.error("Error getting user data:", error)
      throw error
    }

    console.log("User data retrieved:", data)
    return data
  } catch (err) {
    console.error("Failed to get user data:", err)
    throw err
  }
}


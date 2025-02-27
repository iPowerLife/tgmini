import { createClient } from "@supabase/supabase-js"

// Используем переменные окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
}

console.log("Supabase URL:", supabaseUrl)
console.log("Initializing Supabase client...")

export const supabase = createClient(supabaseUrl, supabaseKey)

// Функция для инициализации базы данных
async function initializeDatabase() {
  try {
    console.log("Initializing database...")

    // Создаем таблицу пользователей
    const { error: usersError } = await supabase.rpc("initialize_database")

    if (usersError) {
      console.error("Error initializing database:", usersError)
      return false
    }

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Error in initializeDatabase:", error)
    return false
  }
}

// Функция для тестирования подключения
export async function testConnection() {
  const steps = {
    connection: false,
    usersTable: false,
    levelsTable: false,
    transactionsTable: false,
  }

  try {
    console.log("Testing connection...")
    console.log("Supabase URL:", supabaseUrl)

    // Инициализируем базу данных при первом подключении
    await initializeDatabase()

    // Шаг 1: Проверка базового подключения
    console.log("Step 1: Testing basic connection...")
    const { data: connectionTest, error: connectionError } = await supabase
      .from("users")
      .select("count(*)", { count: "exact", head: true })

    if (connectionError) {
      console.error("Connection error:", connectionError)
      return { success: false, steps, error: "Ошибка подключения к базе данных" }
    }
    steps.connection = true
    console.log("Basic connection successful")

    // Шаг 2: Проверка таблицы users
    console.log("Step 2: Testing users table...")
    const { data: usersTest, error: usersError } = await supabase.from("users").select("id").limit(1)

    if (usersError) {
      console.error("Users table error:", usersError)
      return { success: false, steps, error: "Ошибка доступа к таблице users" }
    }
    steps.usersTable = true
    console.log("Users table accessible")

    // Шаг 3: Проверка таблицы levels
    console.log("Step 3: Testing levels table...")
    const { data: levelsTest, error: levelsError } = await supabase.from("levels").select("level").limit(1)

    if (levelsError) {
      console.error("Levels table error:", levelsError)
      return { success: false, steps, error: "Ошибка доступа к таблице levels" }
    }
    steps.levelsTable = true
    console.log("Levels table accessible")

    // Шаг 4: Проверка таблицы transactions
    console.log("Step 4: Testing transactions table...")
    const { data: transactionsTest, error: transactionsError } = await supabase
      .from("transactions")
      .select("id")
      .limit(1)

    if (transactionsError) {
      console.error("Transactions table error:", transactionsError)
      return { success: false, steps, error: "Ошибка доступа к таблице transactions" }
    }
    steps.transactionsTable = true
    console.log("Transactions table accessible")

    return {
      success: true,
      steps,
      error: null,
    }
  } catch (err) {
    console.error("Test connection failed:", err)
    return {
      success: false,
      steps,
      error: err.message,
    }
  }
}


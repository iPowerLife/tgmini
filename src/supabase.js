import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://tphsnmoitxericjvgwwn.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHNubW9pdHhlcmljanZnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDYyMjc0MSwiZXhwIjoyMDU2MTk4NzQxfQ.FcXliEXtiyJcnLX6xFaSSZLSYtyD9JeLQ4mdOCLR1f4"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Функция для тестирования подключения
export async function testConnection() {
  const steps = {
    connection: false,
    usersTable: false,
    levelsTable: false,
    transactionsTable: false,
  }

  try {
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


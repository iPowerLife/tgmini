import { Telegraf, Markup } from "telegraf"
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Загрузка переменных окружения
dotenv.config()

// Глобальная обработка необработанных ошибок
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error)
})

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error)
})

// Функция для проверки соединения с Supabase
async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count(*)", { count: "exact" })
    if (error) throw error
    console.log("Supabase connection successful")
    return true
  } catch (error) {
    console.error("Supabase connection error:", error)
    return false
  }
}

// Проверка наличия необходимых переменных окружения
const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_KEY", "BOT_TOKEN"]
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not set in environment variables`)
    process.exit(1)
  }
}

// Инициализация Supabase с повторными попытками
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Инициализация бота с настройками
const bot = new Telegraf(process.env.BOT_TOKEN, {
  handlerTimeout: 90000, // 90 секунд таймаут для обработчиков
  telegram: {
    timeout: 30000, // 30 секунд таймаут для API запросов
  },
})

// Middleware для логирования
bot.use(async (ctx, next) => {
  const start = new Date()
  try {
    await next()
    const ms = new Date() - start
    console.log(`${ctx.updateType} from ${ctx.from?.username} processed in ${ms}ms`)
  } catch (error) {
    console.error(`Error processing ${ctx.updateType}:`, error)
    try {
      await ctx.reply("Произошла ошибка при обработке команды. Попробуйте позже.")
    } catch (replyError) {
      console.error("Error sending error message:", replyError)
    }
  }
})

// Базовые команды бота
bot.command("start", async (ctx) => {
  try {
    // Проверяем подключение к базе данных
    const isConnected = await checkSupabaseConnection()
    if (!isConnected) {
      throw new Error("Database connection failed")
    }

    await ctx.reply(
      "Добро пожаловать в игру Майнинг!",
      Markup.keyboard([
        ["⛏️ Майнить", "💰 Баланс"],
        ["🛒 Магазин", "🎒 Инвентарь"],
        ["📊 Статистика", "❓ Помощь"],
      ]).resize(),
    )

    // Логируем успешный старт
    console.log(`New user started bot: ${ctx.from.username} (${ctx.from.id})`)
  } catch (error) {
    console.error("Error in start command:", error)
    await ctx.reply("Произошла ошибка при запуске бота. Пожалуйста, попробуйте позже.")
  }
})

bot.command("help", async (ctx) => {
  try {
    await ctx.reply(`
Доступные команды:
/start - Начать игру
/help - Список команд
/balance - Проверить баланс
/mine - Майнить криптовалюту
/shop - Магазин майнеров
/inventory - Ваш инвентарь
        `)
  } catch (error) {
    console.error("Error in help command:", error)
    await ctx.reply("Произошла ошибка. Попробуйте позже.")
  }
})

// Функция для периодической проверки соединения
async function healthCheck() {
  try {
    const isConnected = await checkSupabaseConnection()
    if (!isConnected) {
      console.error("Health check failed: Database connection lost")
      // Перезапускаем бота при потере соединения
      await bot.stop()
      await bot.launch()
    }
  } catch (error) {
    console.error("Health check error:", error)
  }
}

// Запуск бота с обработкой ошибок
async function startBot() {
  try {
    // Проверяем соединение с базой данных перед запуском
    const isConnected = await checkSupabaseConnection()
    if (!isConnected) {
      throw new Error("Initial database connection failed")
    }

    console.log("Starting bot...")
    await bot.launch()
    console.log("Bot started successfully")

    // Запускаем периодическую проверку здоровья
    setInterval(healthCheck, 30000) // Каждые 30 секунд
  } catch (error) {
    console.error("Error starting bot:", error)
    process.exit(1)
  }
}

// Запускаем бота
startBot()

// Graceful shutdown
const shutdown = async () => {
  try {
    console.log("Shutting down bot...")
    await bot.stop()
    console.log("Bot stopped successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error during shutdown:", error)
    process.exit(1)
  }
}

process.once("SIGINT", shutdown)
process.once("SIGTERM", shutdown)


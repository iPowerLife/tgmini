import { Telegraf, Markup } from "telegraf"
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Загрузка переменных окружения
dotenv.config()

// Вывод всех переменных окружения для отладки (без значений)
console.log("Environment variables:", Object.keys(process.env))

// Проверка наличия необходимых переменных окружения
const requiredEnvVars = {
  SUPABASE_URL: process.env.SUPABASE_URL || process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
  BOT_TOKEN: process.env.BOT_TOKEN,
}

// Проверяем каждую переменную
Object.entries(requiredEnvVars).forEach(([name, value]) => {
  if (!value) {
    console.error(`Error: ${name} is not set in environment variables`)
    process.exit(1)
  } else {
    console.log(`${name} is set`)
  }
})

// Инициализация Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

console.log("Initializing Supabase with URL:", supabaseUrl ? "URL is set" : "URL is missing")

const supabase = createClient(supabaseUrl, supabaseKey)

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN)

// Добавим обработку ошибок
bot.catch((err, ctx) => {
  console.error(`Ошибка для ${ctx.updateType}`, err)
  ctx.reply("Произошла ошибка при обработке команды. Попробуйте позже.")
})

// Базовые команды бота
bot.command("start", async (ctx) => {
  try {
    ctx.reply(
      "Добро пожаловать в игру Майнинг!",
      Markup.keyboard([
        ["⛏️ Майнить", "💰 Баланс"],
        ["🛒 Магазин", "🎒 Инвентарь"],
        ["📊 Статистика", "❓ Помощь"],
      ]).resize(),
    )
  } catch (error) {
    console.error("Error in start command:", error)
    ctx.reply("Произошла ошибка при запуске бота. Пожалуйста, попробуйте позже.")
  }
})

bot.command("help", (ctx) => {
  ctx.reply(`
Доступные команды:
/start - Начать игру
/help - Список команд
/balance - Проверить баланс
/mine - Майнить криптовалюту
/shop - Магазин майнеров
/inventory - Ваш инвентарь
    `)
})

// Запуск бота
console.log("Starting bot...")
bot
  .launch()
  .then(() => {
    console.log("Bot started successfully")
  })
  .catch((err) => {
    console.error("Error starting bot:", err)
  })

// Включаем graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))


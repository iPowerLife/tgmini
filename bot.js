import { Telegraf, Markup } from "telegraf"
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Загрузка переменных окружения
dotenv.config()

// Вывод версии Node.js и статуса запуска
console.log(`Node.js version: ${process.version}`)
console.log("Starting Telegram bot...")

// Проверка переменных окружения
const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_KEY", "BOT_TOKEN"]
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not set in environment variables`)
    process.exit(1)
  }
  console.log(`${envVar} is set`)
}

// Инициализация Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN)

// Простая команда для проверки работы бота
bot.command("start", async (ctx) => {
  console.log("Received /start command")
  try {
    await ctx.reply("Бот запущен и работает! 🚀", Markup.keyboard([["⛏️ Майнить", "💰 Баланс"], ["❓ Помощь"]]).resize())
    console.log("Start command processed successfully")
  } catch (error) {
    console.error("Error in start command:", error)
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
  }
})

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error("Bot error:", err)
  ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
})

// Запуск бота
console.log("Launching bot...")
bot
  .launch()
  .then(() => {
    console.log("Bot successfully started")
  })
  .catch((error) => {
    console.error("Failed to start bot:", error)
    process.exit(1)
  })

// Graceful stop
process.once("SIGINT", () => {
  console.log("SIGINT received. Stopping bot...")
  bot.stop("SIGINT")
})
process.once("SIGTERM", () => {
  console.log("SIGTERM received. Stopping bot...")
  bot.stop("SIGTERM")
})


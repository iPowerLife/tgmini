import { Telegraf } from "telegraf"
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Базовая настройка
dotenv.config()
console.log("Starting bot application...")

// Проверка переменных окружения
const requiredEnvVars = ["BOT_TOKEN", "SUPABASE_URL", "SUPABASE_KEY"]
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`)
    process.exit(1)
  }
  console.log(`Found ${varName}`)
})

// Инициализация Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN)

// Простой обработчик для тестирования
bot.command("start", async (ctx) => {
  console.log("Received /start command")
  try {
    await ctx.reply("Тестовое сообщение: бот работает! 🤖")
    console.log("Sent test message")
  } catch (error) {
    console.error("Error sending message:", error)
  }
})

// Запуск бота
console.log("Launching bot...")
bot
  .launch()
  .then(() => {
    console.log("Bot successfully started!")
  })
  .catch((error) => {
    console.error("Failed to start bot:", error)
    process.exit(1)
  })

// Graceful shutdown
process.once("SIGINT", () => {
  console.log("SIGINT received")
  bot.stop("SIGINT")
})
process.once("SIGTERM", () => {
  console.log("SIGTERM received")
  bot.stop("SIGTERM")
})


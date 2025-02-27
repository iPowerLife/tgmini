import { Telegraf, Markup } from "telegraf"
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Загрузка переменных окружения
dotenv.config()

// Проверка наличия необходимых переменных окружения
const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_KEY", "BOT_TOKEN"]
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not set in environment variables`)
    process.exit(1)
  }
}

// Инициализация Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN)

// Базовые команды бота
bot.command("start", async (ctx) => {
  try {
    await ctx.reply(
      "Добро пожаловать в игру Майнинг!",
      Markup.keyboard([
        ["⛏️ Майнить", "💰 Баланс"],
        ["🛒 Магазин", "🎒 Инвентарь"],
        ["📊 Статистика", "❓ Помощь"],
      ]).resize(),
    )
  } catch (error) {
    console.error("Error in start command:", error)
    await ctx.reply("Произошла ошибка при запуске бота. Пожалуйста, попробуйте позже.")
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
    process.exit(1)
  })

// Включаем graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))


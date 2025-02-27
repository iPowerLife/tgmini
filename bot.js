import { Telegraf, Markup } from "telegraf"
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Загрузка переменных окружения
dotenv.config()

// Проверка наличия необходимых переменных окружения
if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is not set in environment variables")
}

if (!process.env.SUPABASE_KEY) {
  throw new Error("SUPABASE_KEY is not set in environment variables")
}

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not set in environment variables")
}

// Инициализация Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN)

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


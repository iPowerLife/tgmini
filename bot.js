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

// Инициализация Supabase с явной проверкой
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

console.log("Initializing Supabase with URL:", supabaseUrl) // Добавляем лог для отладки

const supabase = createClient(supabaseUrl, supabaseKey)

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN)

// Добавим обработку ошибок
bot.catch((err, ctx) => {
  console.error(`Ошибка для ${ctx.updateType}`, err)
  ctx.reply("Произошла ошибка при обработке команды. Попробуйте позже.")
})

// Добавим логирование
bot.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log("Response time: %sms", ms)
})

// Базовые команды бота
bot.command("start", async (ctx) => {
  try {
    // Проверяем подключение к Supabase
    const { data, error } = await supabase.from("users").select("*").limit(1)

    if (error) {
      console.error("Supabase connection test failed:", error)
      throw error
    }

    console.log("Supabase connection test successful")

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

if (process.env.NODE_ENV === "production") {
  // Запуск в режиме webhook для продакшена
  const PORT = process.env.PORT || 3000
  bot
    .launch({
      webhook: {
        domain: process.env.DOMAIN,
        port: PORT,
      },
    })
    .then(() => {
      console.log("Bot started in webhook mode")
    })
    .catch((err) => {
      console.error("Error starting bot:", err)
    })
} else {
  // Запуск в режиме polling для разработки
  bot
    .launch()
    .then(() => {
      console.log("Bot started in polling mode")
    })
    .catch((err) => {
      console.error("Error starting bot:", err)
    })
}

// Включаем graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))


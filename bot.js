import { Telegraf } from "telegraf"
import * as dotenv from "dotenv"

// Загрузка переменных окружения
dotenv.config()

// Проверка наличия токена
if (!process.env.BOT_TOKEN) {
  console.error("BOT_TOKEN is required!")
  process.exit(1)
}

// Создание экземпляра бота
const bot = new Telegraf(process.env.BOT_TOKEN)

// Добавляем обработчик для логирования
bot.use((ctx, next) => {
  console.log("Received update:", ctx.update)
  return next()
})

// Команда /start
bot.command("start", (ctx) => {
  console.log("Received start command")
  return ctx.reply("Бот запущен и работает! 🚀")
})

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error("Bot error:", err)
})

// Запуск бота
console.log("Starting bot...")
bot
  .launch()
  .then(() => {
    console.log("Bot is running!")
    return bot.telegram.getMe()
  })
  .then((botInfo) => {
    console.log("Bot info:", botInfo)
  })
  .catch((err) => {
    console.error("Failed to start bot:", err)
    process.exit(1)
  })

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))


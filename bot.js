const { Telegraf } = require("telegraf")
const dotenv = require("dotenv")

// Загрузка переменных окружения
dotenv.config()

console.log("=== Bot Startup Diagnostics ===")

// Проверка BOT_TOKEN
const token = process.env.BOT_TOKEN
if (!token) {
  console.error("BOT_TOKEN is missing!")
  process.exit(1)
}
console.log("BOT_TOKEN found, length:", token.length)

// Создание экземпляра бота
const bot = new Telegraf(token)

// Добавляем middleware для логирования
bot.use((ctx, next) => {
  console.log("Received update:", JSON.stringify(ctx.update, null, 2))
  return next()
})

// Команда /start
bot.command("start", (ctx) => {
  console.log("Received start command from:", ctx.from.id)
  return ctx.reply("Бот запущен и работает! 🚀")
})

// Команда /test
bot.command("test", (ctx) => {
  console.log("Received test command from:", ctx.from.id)
  return ctx.reply("Тест успешен! Бот работает.")
})

// Обработчик текстовых сообщений
bot.on("text", (ctx) => {
  console.log("Received message:", ctx.message.text)
  return ctx.reply(`Получил ваше сообщение: ${ctx.message.text}`)
})

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error("Bot error:", err)
  return ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
})

// Запуск бота
console.log("Starting bot...")
bot
  .launch()
  .then(() => {
    console.log("Bot successfully started!")
    return bot.telegram.getMe()
  })
  .then((botInfo) => {
    console.log("Bot info:", botInfo)
    console.log(`Bot username: @${botInfo.username}`)
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

console.log("=== Bot setup completed ===")


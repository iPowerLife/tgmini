import { Telegraf } from "telegraf"
import * as dotenv from "dotenv"

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

// Создание экземпляра бота с отладочной информацией
const bot = new Telegraf(token, {
  handlerTimeout: 90_000, // Увеличиваем таймаут
})

// Добавляем middleware для логирования всех обновлений
bot.use(async (ctx, next) => {
  console.log("Received update:", JSON.stringify(ctx.update, null, 2))
  await next()
})

// Базовые команды
bot.command("start", async (ctx) => {
  console.log("Start command received from:", ctx.from.id)
  try {
    await ctx.reply("Бот запущен! Отправьте /test для проверки.")
    console.log("Start response sent successfully")
  } catch (error) {
    console.error("Error in start command:", error)
  }
})

bot.command("test", async (ctx) => {
  console.log("Test command received from:", ctx.from.id)
  try {
    await ctx.reply("Тест успешен! Бот работает.")
    console.log("Test response sent successfully")
  } catch (error) {
    console.error("Error in test command:", error)
  }
})

// Обработчик текстовых сообщений
bot.on("text", async (ctx) => {
  console.log("Received text message:", ctx.message.text)
  try {
    await ctx.reply("Получил ваше сообщение: " + ctx.message.text)
    console.log("Text message response sent successfully")
  } catch (error) {
    console.error("Error in text message handler:", error)
  }
})

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error("Bot error occurred:", err)
  console.error("Update that caused error:", ctx.update)
})

// Запуск бота в режиме long polling
console.log("Starting bot in long polling mode...")
bot
  .launch({
    dropPendingUpdates: true, // Игнорируем старые сообщения
    polling: {
      timeout: 30, // Уменьшаем таймаут polling
    },
  })
  .then(() => {
    console.log("Bot successfully started!")
    // Проверяем информацию о боте
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
const stopBot = () => {
  console.log("Stopping bot...")
  bot.stop("SIGTERM")
  process.exit(0)
}

process.once("SIGINT", stopBot)
process.once("SIGTERM", stopBot)

// Держим процесс активным
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error)
})

console.log("=== Bot setup completed ===")


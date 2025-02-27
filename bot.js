import { Telegraf } from "telegraf"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

// Инициализация бота с существующим токеном
const bot = new Telegraf("8184998407:AAG8OH_e58vxShBrjKYmEzWU3PreRzc8mko")

// Инициализация Supabase с существующими данными
const supabase = createClient(
  "https://tphsnmoitxericjvgwwn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHNubW9pdHhlcmljanZnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjI3NDEsImV4cCI6MjA1NjE5ODc0MX0.ZArqTk-yG6PFaVQmSaoymvyGXF3McWhmPC7MePYK_lQ",
)

// Команда /start
bot.command("start", async (ctx) => {
  try {
    // Проверяем существование пользователя
    const { data: existingUser } = await supabase.from("users").select("*").eq("telegram_id", ctx.from.id).single()

    if (!existingUser) {
      // Создаем нового пользователя
      await supabase.from("users").insert([
        {
          telegram_id: ctx.from.id,
          username: ctx.from.username,
          balance: 0,
          mining_power: 1,
          level: 1,
          experience: 0,
          next_level_exp: 100,
        },
      ])
    }

    // Отправляем приветственное сообщение с кнопкой
    ctx.reply(`Привет, ${ctx.from.first_name}! 👋\nДобро пожаловать в игру Майнинг!`, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🎮 Открыть игру",
              web_app: { url: "https://tgmini-production.up.railway.app" },
            },
          ],
        ],
      },
    })
  } catch (error) {
    console.error("Ошибка в команде /start:", error)
    ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
  }
})

// Запускаем бота
bot
  .launch()
  .then(() => console.log("Бот запущен"))
  .catch((err) => console.error("Ошибка запуска бота:", err))

// Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))


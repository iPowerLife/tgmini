import { createClient } from "@supabase/supabase-js"
import { Telegraf, Markup } from "telegraf"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize Telegram bot
const botToken = process.env.BOT_TOKEN
const bot = new Telegraf(botToken)

// Placeholder for registerUser function (replace with actual implementation)
async function registerUser(telegramId, username) {
  // Check if user exists
  const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId)

  if (error) {
    console.error("Error checking user:", error)
    return null
  }

  if (data && data.length > 0) {
    return data[0] // User already exists
  }

  // If user doesn't exist, create them
  const { data: insertData, error: insertError } = await supabase
    .from("users")
    .insert([{ telegram_id: telegramId, username: username, balance: 0, mining_power: 1, level: 1 }])

  if (insertError) {
    console.error("Error registering user:", insertError)
    return null
  }

  return insertData[0]
}

// Функция для получения рейтинга игроков
async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from("users")
    .select("id, telegram_id, username, balance, mining_power, level")
    .order("balance", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error getting leaderboard:", error)
    return []
  }

  return data
}

// Добавляем обработчик команды для получения рейтинга
bot.command("leaderboard", async (ctx) => {
  const leaderboard = await getLeaderboard()

  if (leaderboard.length > 0) {
    let message = "🏆 Рейтинг игроков:\n\n"

    leaderboard.forEach((player, index) => {
      message += `${index + 1}. ${player.username || "Игрок"} - ${player.balance.toFixed(2)} монет (Уровень ${player.level})\n`
    })

    ctx.reply(message)
  } else {
    ctx.reply("Пока нет игроков в рейтинге.")
  }
})

// Добавляем кнопку для получения рейтинга
bot.hears("🏆 Рейтинг", async (ctx) => {
  const leaderboard = await getLeaderboard()

  if (leaderboard.length > 0) {
    let message = "🏆 Рейтинг игроков:\n\n"

    leaderboard.forEach((player, index) => {
      message += `${index + 1}. ${player.username || "Игрок"} - ${player.balance.toFixed(2)} монет (Уровень ${player.level})\n`
    })

    ctx.reply(message)
  } else {
    ctx.reply("Пока нет игроков в рейтинге.")
  }
})

// Обновляем клавиатуру в команде start
bot.start(async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (user) {
    ctx.reply(
      `Добро пожаловать в игру Майнинг, ${ctx.from.first_name}!`,
      Markup.keyboard([
        ["⛏️ Майнить", "💰 Баланс"],
        ["🛒 Магазин", "🎒 Инвентарь"],
        ["📊 Статистика", "🎁 Ежедневный бонус"],
        ["🏆 Рейтинг", "❓ Помощь"],
      ]).resize(),
    )
  } else {
    ctx.reply("Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.")
  }
})

// Экспортируем функцию
export { getLeaderboard }


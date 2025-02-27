import { createClient } from "@supabase/supabase-js"
import { Telegraf, Markup } from "telegraf"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize Telegram bot
const botToken = process.env.BOT_TOKEN
const bot = new Telegraf(botToken)

// Import registerUser and addExperience functions (assuming they are in separate modules)
import { registerUser } from "./register-user" // Adjust path as needed
import { addExperience } from "./add-experience" // Adjust path as needed

// Функция для получения ежедневного бонуса
async function getDailyBonus(userId) {
  // Получаем пользователя
  const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

  if (userError) {
    console.error("Error getting user:", userError)
    return { success: false, message: "Ошибка получения данных пользователя" }
  }

  // Проверяем, получал ли пользователь бонус сегодня
  const lastBonusDate = user.last_bonus_date ? new Date(user.last_bonus_date) : null
  const now = new Date()

  // Если дата последнего бонуса существует и это сегодня, то бонус уже получен
  if (
    lastBonusDate &&
    lastBonusDate.getDate() === now.getDate() &&
    lastBonusDate.getMonth() === now.getMonth() &&
    lastBonusDate.getFullYear() === now.getFullYear()
  ) {
    return {
      success: false,
      message: "Вы уже получили ежедневный бонус сегодня. Приходите завтра!",
    }
  }

  // Рассчитываем бонус (базовый бонус + бонус за уровень)
  const baseBonus = 50
  const levelBonus = user.level * 10
  const totalBonus = baseBonus + levelBonus

  // Обновляем баланс и дату последнего бонуса
  const { error: updateError } = await supabase
    .from("users")
    .update({
      balance: user.balance + totalBonus,
      last_bonus_date: now.toISOString(),
    })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating user:", updateError)
    return { success: false, message: "Ошибка обновления баланса" }
  }

  // Записываем транзакцию
  await supabase.from("transactions").insert([
    {
      user_id: userId,
      amount: totalBonus,
      type: "daily_bonus",
      description: "Ежедневный бонус",
    },
  ])

  // Добавляем немного опыта за получение бонуса
  const expGained = 20
  await addExperience(userId, expGained)

  return {
    success: true,
    message: `Вы получили ежедневный бонус: ${totalBonus} монет (${baseBonus} базовый + ${levelBonus} за уровень) и ${expGained} опыта!`,
    bonus: totalBonus,
    balance: user.balance + totalBonus,
  }
}

// Добавляем колонку для отслеживания даты последнего бонуса
// Выполните этот SQL-запрос в Supabase:
// ALTER TABLE users ADD COLUMN last_bonus_date TIMESTAMP;

// Добавляем обработчик команды для получения бонуса
bot.command("daily", async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (!user) {
    ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
    return
  }

  const result = await getDailyBonus(user.id)
  ctx.reply(result.message)

  if (result.success) {
    ctx.reply(`Ваш новый баланс: ${result.balance.toFixed(2)} монет`)
  }
})

// Добавляем кнопку для получения бонуса
bot.hears("🎁 Ежедневный бонус", async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (!user) {
    ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
    return
  }

  const result = await getDailyBonus(user.id)
  ctx.reply(result.message)

  if (result.success) {
    ctx.reply(`Ваш новый баланс: ${result.balance.toFixed(2)} монет`)
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
        ["❓ Помощь"],
      ]).resize(),
    )
  } else {
    ctx.reply("Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.")
  }
})

// Экспортируем функцию
export { getDailyBonus }


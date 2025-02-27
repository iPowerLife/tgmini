import { Telegraf, Markup } from "telegraf"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

// Инициализация Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN)

// URL веб-приложения
const WEBAPP_URL = process.env.WEBAPP_URL

// Функции для работы с базой данных
async function registerUser(telegramId, username) {
  try {
    const { data: existingUser } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

    if (existingUser) {
      return existingUser
    }

    const { data: newUser, error } = await supabase
      .from("users")
      .insert([{ telegram_id: telegramId, username: username }])
      .select()
      .single()

    if (error) throw error
    return newUser
  } catch (error) {
    console.error("Error in registerUser:", error)
    return null
  }
}

async function mineCoins(userId) {
  try {
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) throw userError

    const lastMining = new Date(user.last_mining)
    const now = new Date()
    const diffMinutes = (now - lastMining) / (1000 * 60)

    if (diffMinutes < 1) {
      return {
        success: false,
        message: `Подождите ещё ${Math.ceil(60 - diffMinutes * 60)} секунд до следующего майнинга`,
      }
    }

    const minedAmount = user.mining_power
    const expGained = Math.floor(minedAmount * 0.1)

    const { error: updateError } = await supabase
      .from("users")
      .update({
        balance: user.balance + minedAmount,
        last_mining: now.toISOString(),
        experience: user.experience + expGained,
      })
      .eq("id", userId)

    if (updateError) throw updateError

    await supabase.from("transactions").insert([
      {
        user_id: userId,
        amount: minedAmount,
        type: "mining",
        description: "Майнинг криптовалюты",
      },
    ])

    return {
      success: true,
      message: `Вы добыли ${minedAmount.toFixed(2)} монет и получили ${expGained} опыта!`,
      balance: user.balance + minedAmount,
    }
  } catch (error) {
    console.error("Error in mineCoins:", error)
    return { success: false, message: "Произошла ошибка при майнинге" }
  }
}

// Команды бота
bot.command("start", async (ctx) => {
  try {
    const user = await registerUser(ctx.from.id, ctx.from.username)
    if (!user) {
      return ctx.reply("Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.")
    }

    return ctx.reply(`Добро пожаловать в игру Майнинг, ${ctx.from.first_name}!`, {
      reply_markup: {
        keyboard: [
          ["⛏️ Майнить", "💰 Баланс"],
          ["🛒 Магазин", "🎒 Инвентарь"],
          ["📊 Статистика", "❓ Помощь"],
        ],
        resize_keyboard: true,
        ...Markup.inlineKeyboard([[{ text: "🎮 Открыть игру", web_app: { url: WEBAPP_URL } }]]),
      },
    })
  } catch (error) {
    console.error("Error in start command:", error)
    return ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
  }
})

bot.hears("⛏️ Майнить", async (ctx) => {
  try {
    const user = await registerUser(ctx.from.id, ctx.from.username)
    if (!user) {
      return ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
    }

    const result = await mineCoins(user.id)
    await ctx.reply(result.message)

    if (result.success) {
      await ctx.reply(`Ваш текущий баланс: ${result.balance.toFixed(2)} монет`)
    }
  } catch (error) {
    console.error("Error in mine command:", error)
    return ctx.reply("Произошла ошибка при майнинге. Пожалуйста, попробуйте позже.")
  }
})

bot.hears("💰 Баланс", async (ctx) => {
  try {
    const user = await registerUser(ctx.from.id, ctx.from.username)
    if (!user) {
      return ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
    }

    const { data: userData } = await supabase.from("users").select("balance, mining_power").eq("id", user.id).single()

    return ctx.reply(
      `💰 Ваш баланс: ${userData.balance.toFixed(2)} монет\n⚡ Мощность майнинга: ${userData.mining_power.toFixed(2)} монет/мин`,
    )
  } catch (error) {
    console.error("Error in balance command:", error)
    return ctx.reply("Произошла ошибка при получении баланса. Пожалуйста, попробуйте позже.")
  }
})

// Запуск бота
bot
  .launch()
  .then(() => console.log("Bot started successfully"))
  .catch((error) => {
    console.error("Error starting bot:", error)
    process.exit(1)
  })

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))


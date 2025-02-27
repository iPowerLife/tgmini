import { createClient } from "@supabase/supabase-js"
import { Telegraf, session, Markup } from "telegraf"
import dotenv from "dotenv"

// Загрузка переменных окружения
dotenv.config()

// Инициализация Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN)

// Middleware для сессий
bot.use(session())

// Функции для работы с базой данных (те же, что и раньше)
async function registerUser(telegramId, username) {
  try {
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", telegramId)
      .single()

    if (selectError) {
      console.error("Ошибка при запросе пользователя:", selectError)
      return null
    }

    if (existingUser) {
      return existingUser
    }

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([{ telegram_id: telegramId, username: username }])
      .single()

    if (insertError) {
      console.error("Ошибка при регистрации пользователя:", insertError)
      return null
    }

    return newUser
  } catch (error) {
    console.error("Ошибка при регистрации или запросе пользователя:", error)
    return null
  }
}

async function mineCoins(userId) {
  try {
    // Получаем информацию о пользователе, включая его мощность майнинга
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, balance, mining_power")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Ошибка при получении пользователя:", userError)
      return { success: false, message: "Произошла ошибка при получении информации о пользователе." }
    }

    if (!user) {
      return { success: false, message: "Пользователь не найден." }
    }

    // Рассчитываем количество добытых монет (мощность майнинга * 1 минута)
    const minedAmount = user.mining_power

    // Обновляем баланс пользователя
    const newBalance = user.balance + minedAmount
    const { error: updateError } = await supabase.from("users").update({ balance: newBalance }).eq("id", userId)

    if (updateError) {
      console.error("Ошибка при обновлении баланса:", updateError)
      return { success: false, message: "Произошла ошибка при обновлении баланса." }
    }

    // Записываем транзакцию
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert([{ user_id: userId, amount: minedAmount, type: "mining" }])

    if (transactionError) {
      console.error("Ошибка при записи транзакции:", transactionError)
      // Не критично, можно продолжать
    }

    return { success: true, message: `Вы успешно намайнили ${minedAmount.toFixed(2)} монет!`, balance: newBalance }
  } catch (error) {
    console.error("Ошибка при майнинге:", error)
    return { success: false, message: "Произошла ошибка во время майнинга." }
  }
}

async function getAvailableMiners() {
  try {
    const { data: miners, error } = await supabase.from("miners").select("*")

    if (error) {
      console.error("Ошибка при получении списка майнеров:", error)
      return []
    }

    return miners
  } catch (error) {
    console.error("Ошибка при получении списка майнеров:", error)
    return []
  }
}

async function buyMiner(userId, minerId) {
  try {
    // Получаем информацию о пользователе
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, balance, mining_power")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Ошибка при получении пользователя:", userError)
      return { success: false, message: "Произошла ошибка при получении информации о пользователе." }
    }

    if (!user) {
      return { success: false, message: "Пользователь не найден." }
    }

    // Получаем информацию о майнере
    const { data: miner, error: minerError } = await supabase.from("miners").select("*").eq("id", minerId).single()

    if (minerError) {
      console.error("Ошибка при получении информации о майнере:", minerError)
      return { success: false, message: "Произошла ошибка при получении информации о майнере." }
    }

    if (!miner) {
      return { success: false, message: "Майнер не найден." }
    }

    // Проверяем, достаточно ли средств у пользователя
    if (user.balance < miner.price) {
      return { success: false, message: "Недостаточно средств для покупки этого майнера." }
    }

    // Списываем средства с баланса пользователя
    const newBalance = user.balance - miner.price
    const newMiningPower = user.mining_power + miner.power

    const { error: updateError } = await supabase
      .from("users")
      .update({ balance: newBalance, mining_power: newMiningPower })
      .eq("id", userId)

    if (updateError) {
      console.error("Ошибка при обновлении баланса пользователя:", updateError)
      return { success: false, message: "Произошла ошибка при обновлении баланса." }
    }

    // Добавляем майнер в инвентарь пользователя
    const { data: existingInventoryItem, error: selectError } = await supabase
      .from("user_miners")
      .select("*")
      .eq("user_id", userId)
      .eq("miner_id", minerId)

    if (selectError) {
      console.error("Ошибка при проверке инвентаря:", selectError)
      return { success: false, message: "Произошла ошибка при проверке инвентаря." }
    }

    if (existingInventoryItem && existingInventoryItem.length > 0) {
      // Если майнер уже есть в инвентаре, увеличиваем количество
      const { error: updateInventoryError } = await supabase
        .from("user_miners")
        .update({ quantity: existingInventoryItem[0].quantity + 1 })
        .eq("user_id", userId)
        .eq("miner_id", minerId)

      if (updateInventoryError) {
        console.error("Ошибка при обновлении инвентаря:", updateInventoryError)
        return { success: false, message: "Произошла ошибка при обновлении инвентаря." }
      }
    } else {
      // Если майнера нет в инвентаре, добавляем новую запись
      const { error: insertInventoryError } = await supabase
        .from("user_miners")
        .insert([{ user_id: userId, miner_id: minerId, quantity: 1 }])

      if (insertInventoryError) {
        console.error("Ошибка при добавлении в инвентарь:", insertInventoryError)
        return { success: false, message: "Произошла ошибка при добавлении майнера в инвентарь." }
      }
    }

    // Записываем транзакцию
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert([{ user_id: userId, amount: -miner.price, type: "purchase", description: `Куплен майнер ${miner.name}` }])

    if (transactionError) {
      console.error("Ошибка при записи транзакции:", transactionError)
      // Не критично, можно продолжать
    }

    return {
      success: true,
      message: `Вы успешно купили ${miner.name}!`,
      balance: newBalance,
      mining_power: newMiningPower,
    }
  } catch (error) {
    console.error("Ошибка при покупке майнера:", error)
    return { success: false, message: "Произошла ошибка при покупке майнера." }
  }
}

async function getUserMiners(userId) {
  try {
    const { data: userMiners, error } = await supabase
      .from("user_miners")
      .select("*, miners(name, power, price)")
      .eq("user_id", userId)

    if (error) {
      console.error("Ошибка при получении инвентаря пользователя:", error)
      return []
    }

    return userMiners
  } catch (error) {
    console.error("Ошибка при получении инвентаря пользователя:", error)
    return []
  }
}
// ... (все функции из предыдущего примера)

// Обработчики команд бота с кнопками
bot.start(async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (user) {
    ctx.reply(
      `Добро пожаловать в игру Майнинг, ${ctx.from.first_name}!`,
      Markup.keyboard([
        ["⛏️ Майнить", "💰 Баланс"],
        ["🛒 Магазин", "🎒 Инвентарь"],
        ["📊 Статистика", "❓ Помощь"],
      ]).resize(),
    )
  } else {
    ctx.reply("Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.")
  }
})

bot.help((ctx) => {
  ctx.reply(`
Доступные команды:
/start - Начать игру
/balance - Проверить баланс
/mine - Майнить криптовалюту
/shop - Магазин майнеров
/inventory - Ваш инвентарь
/stats - Ваша статистика
/help - Список команд

Или используйте кнопки внизу экрана.
  `)
})

// Обработчики текстовых команд с кнопок
bot.hears("⛏️ Майнить", async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (user) {
    const result = await mineCoins(user.id)
    ctx.reply(result.message)
    if (result.success) {
      ctx.reply(`Ваш новый баланс: ${result.balance.toFixed(2)} монет`)
    }
  } else {
    ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
  }
})

bot.hears("💰 Баланс", async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (user) {
    ctx.reply(`Ваш баланс: ${user.balance.toFixed(2)} монет`)
  } else {
    ctx.reply("Произошла ошибка при получении баланса. Пожалуйста, попробуйте позже.")
  }
})

bot.hears("🛒 Магазин", async (ctx) => {
  const miners = await getAvailableMiners()
  if (miners.length > 0) {
    let message = "Доступные майнеры:\n\n"
    const buttons = []

    miners.forEach((miner, index) => {
      message += `${index + 1}. ${miner.name}\n`
      message += `   Мощность: ${miner.power} монет/мин\n`
      message += `   Цена: ${miner.price} монет\n`
      message += `   Описание: ${miner.description}\n\n`

      buttons.push(Markup.button.callback(`Купить ${miner.name}`, `buy_${miner.id}`))
    })

    // Группируем кнопки по 2 в ряд
    const buttonRows = []
    for (let i = 0; i < buttons.length; i += 2) {
      buttonRows.push(buttons.slice(i, i + 2))
    }

    ctx.reply(message, Markup.inlineKeyboard(buttonRows))
  } else {
    ctx.reply("В магазине пока нет доступных майнеров.")
  }
})

// Обработчик нажатия на кнопку покупки
bot.action(/buy_(\d+)/, async (ctx) => {
  const minerId = Number.parseInt(ctx.match[1])
  const user = await registerUser(ctx.from.id, ctx.from.username)

  if (!user) {
    ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
    return
  }

  const result = await buyMiner(user.id, minerId)
  await ctx.answerCbQuery() // Убираем "часики" с кнопки
  ctx.reply(result.message)

  if (result.success) {
    ctx.reply(
      `Ваш новый баланс: ${result.balance.toFixed(2)} монет\nМощность майнинга: ${result.mining_power.toFixed(2)} монет/мин`,
    )
  }
})

bot.hears("🎒 Инвентарь", async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (!user) {
    ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
    return
  }

  const userMiners = await getUserMiners(user.id)

  if (userMiners.length > 0) {
    let message = "Ваш инвентарь:\n\n"
    userMiners.forEach((item) => {
      message += `${item.miners.name} x${item.quantity}\n`
      message += `   Мощность: ${item.miners.power} монет/мин\n`
      message += `   Стоимость: ${item.miners.price} монет\n\n`
    })
    ctx.reply(message)
  } else {
    ctx.reply("У вас пока нет майнеров. Используйте /shop для покупки.")
  }
})

bot.hears("📊 Статистика", async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (!user) {
    ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
    return
  }

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  let message = `Статистика игрока:\n\n`
  message += `Имя: ${ctx.from.first_name}\n`
  message += `Баланс: ${user.balance.toFixed(2)} монет\n`
  message += `Мощность майнинга: ${user.mining_power.toFixed(2)} монет/мин\n`
  message += `Дата регистрации: ${new Date(user.created_at).toLocaleDateString()}\n\n`

  if (!error && transactions.length > 0) {
    message += `Последние транзакции:\n`
    transactions.forEach((tx) => {
      message += `${new Date(tx.created_at).toLocaleString()}: ${tx.amount > 0 ? "+" : ""}${tx.amount.toFixed(2)} (${tx.type})\n`
    })
  }

  ctx.reply(message)
})

bot.hears("❓ Помощь", (ctx) => {
  ctx.reply(`
Добро пожаловать в игру "Майнинг"!

Ваша цель - добывать криптовалюту и улучшать свое оборудование для майнинга.

Основные команды:
⛏️ Майнить - добывать криптовалюту
💰 Баланс - проверить свой баланс
🛒 Магазин - купить новое оборудование
🎒 Инвентарь - посмотреть свое оборудование
📊 Статистика - ваша игровая статистика
❓ Помощь - эта справка

Чем больше мощность вашего оборудования, тем больше криптовалюты вы сможете добыть!
  `)
})

// Сохраняем обработчики обычных команд для совместимости
bot.command("balance", async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (user) {
    ctx.reply(`Ваш баланс: ${user.balance.toFixed(2)} монет`)
  } else {
    ctx.reply("Произошла ошибка при получении баланса. Пожалуйста, попробуйте позже.")
  }
})

bot.command("mine", async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (user) {
    const result = await mineCoins(user.id)
    ctx.reply(result.message)
    if (result.success) {
      ctx.reply(`Ваш новый баланс: ${result.balance.toFixed(2)} монет`)
    }
  } else {
    ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
  }
})

bot.command("shop", async (ctx) => {
  const miners = await getAvailableMiners()
  if (miners.length > 0) {
    let message = "Доступные майнеры:\n\n"
    const buttons = []

    miners.forEach((miner, index) => {
      message += `${index + 1}. ${miner.name}\n`
      message += `   Мощность: ${miner.power} монет/мин\n`
      message += `   Цена: ${miner.price} монет\n`
      message += `   Описание: ${miner.description}\n\n`

      buttons.push(Markup.button.callback(`Купить ${miner.name}`, `buy_${miner.id}`))
    })

    // Группируем кнопки по 2 в ряд
    const buttonRows = []
    for (let i = 0; i < buttons.length; i += 2) {
      buttonRows.push(buttons.slice(i, i + 2))
    }

    ctx.reply(message, Markup.inlineKeyboard(buttonRows))
  } else {
    ctx.reply("В магазине пока нет доступных майнеров.")
  }
})

bot.command("inventory", async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (!user) {
    ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
    return
  }

  const userMiners = await getUserMiners(user.id)

  if (userMiners.length > 0) {
    let message = "Ваш инвентарь:\n\n"
    userMiners.forEach((item) => {
      message += `${item.miners.name} x${item.quantity}\n`
      message += `   Мощность: ${item.miners.power} монет/мин\n`
      message += `   Стоимость: ${item.miners.price} монет\n\n`
    })
    ctx.reply(message)
  } else {
    ctx.reply("У вас пока нет майнеров. Используйте /shop для покупки.")
  }
})

bot.command("stats", async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (!user) {
    ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
    return
  }

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  let message = `Статистика игрока:\n\n`
  message += `Имя: ${ctx.from.first_name}\n`
  message += `Баланс: ${user.balance.toFixed(2)} монет\n`
  message += `Мощность майнинга: ${user.mining_power.toFixed(2)} монет/мин\n`
  message += `Дата регистрации: ${new Date(user.created_at).toLocaleDateString()}\n\n`

  if (!error && transactions.length > 0) {
    message += `Последние транзакции:\n`
    transactions.forEach((tx) => {
      message += `${new Date(tx.created_at).toLocaleString()}: ${tx.amount > 0 ? "+" : ""}${tx.amount.toFixed(2)} (${tx.type})\n`
    })
  }

  ctx.reply(message)
})

// Запуск бота
bot
  .launch()
  .then(() => {
    console.log("Бот запущен!")
  })
  .catch((err) => {
    console.error("Ошибка запуска бота:", err)
  })

// Обработка остановки
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))


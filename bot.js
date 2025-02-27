import { createClient } from "@supabase/supabase-js"
import { Telegraf, session } from "telegraf"

// Инициализация Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN)

// Middleware для сессий
bot.use(session())

// Функция для регистрации пользователя
async function registerUser(telegramId, username) {
  const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

  if (error || !data) {
    // Пользователь не найден, создаем нового
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([{ telegram_id: telegramId, username: username }])
      .select()

    if (insertError) {
      console.error("Error creating user:", insertError)
      return null
    }

    // Добавляем базовый майнер новому пользователю
    const { data: miners } = await supabase.from("miners").select("*").eq("name", "Базовый компьютер").single()

    if (miners) {
      await supabase.from("user_miners").insert([{ user_id: newUser[0].id, miner_id: miners.id }])
    }

    return newUser[0]
  }

  return data
}

// Функция для получения баланса пользователя
async function getUserBalance(userId) {
  const { data, error } = await supabase.from("users").select("balance").eq("id", userId).single()

  if (error) {
    console.error("Error getting user balance:", error)
    return 0
  }

  return data.balance
}

// Функция для майнинга
async function mineCoins(userId) {
  // Получаем пользователя
  const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

  if (userError) {
    console.error("Error getting user:", userError)
    return { success: false, message: "Ошибка получения данных пользователя" }
  }

  // Проверяем, прошло ли достаточно времени с последнего майнинга (минимум 1 минута)
  const lastMining = new Date(user.last_mining)
  const now = new Date()
  const diffMinutes = (now - lastMining) / (1000 * 60)

  if (diffMinutes < 1) {
    return {
      success: false,
      message: `Подождите еще ${Math.ceil(60 - diffMinutes * 60)} секунд до следующего майнинга`,
    }
  }

  // Рассчитываем добытые монеты (зависит от mining_power и прошедшего времени)
  const minedCoins = user.mining_power * Math.min(diffMinutes, 60)

  // Обновляем баланс и время последнего майнинга
  const { error: updateError } = await supabase
    .from("users")
    .update({
      balance: user.balance + minedCoins,
      last_mining: now.toISOString(),
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
      amount: minedCoins,
      type: "mining",
      description: "Майнинг криптовалюты",
    },
  ])

  return {
    success: true,
    message: `Вы добыли ${minedCoins.toFixed(2)} монет!`,
    balance: user.balance + minedCoins,
  }
}

// Функция для получения списка доступных майнеров
async function getAvailableMiners() {
  const { data, error } = await supabase.from("miners").select("*").order("price", { ascending: true })

  if (error) {
    console.error("Error getting miners:", error)
    return []
  }

  return data
}

// Функция для покупки майнера
async function buyMiner(userId, minerId) {
  // Получаем информацию о майнере
  const { data: miner, error: minerError } = await supabase.from("miners").select("*").eq("id", minerId).single()

  if (minerError) {
    console.error("Error getting miner:", minerError)
    return { success: false, message: "Майнер не найден" }
  }

  // Получаем баланс пользователя
  const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

  if (userError) {
    console.error("Error getting user:", userError)
    return { success: false, message: "Пользователь не найден" }
  }

  // Проверяем, достаточно ли средств
  if (user.balance < miner.price) {
    return {
      success: false,
      message: `Недостаточно средств. Нужно: ${miner.price}, у вас: ${user.balance.toFixed(2)}`,
    }
  }

  // Проверяем, есть ли уже такой майнер у пользователя
  const { data: existingMiner, error: existingError } = await supabase
    .from("user_miners")
    .select("*")
    .eq("user_id", userId)
    .eq("miner_id", minerId)
    .single()

  // Обновляем баланс пользователя
  const { error: updateError } = await supabase
    .from("users")
    .update({
      balance: user.balance - miner.price,
      mining_power: user.mining_power + miner.power,
    })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating user:", updateError)
    return { success: false, message: "Ошибка обновления баланса" }
  }

  // Добавляем или обновляем майнер в инвентаре пользователя
  if (existingMiner && !existingError) {
    await supabase
      .from("user_miners")
      .update({ quantity: existingMiner.quantity + 1 })
      .eq("id", existingMiner.id)
  } else {
    await supabase.from("user_miners").insert([{ user_id: userId, miner_id: minerId }])
  }

  // Записываем транзакцию
  await supabase.from("transactions").insert([
    {
      user_id: userId,
      amount: -miner.price,
      type: "purchase",
      description: `Покупка майнера: ${miner.name}`,
    },
  ])

  return {
    success: true,
    message: `Вы купили майнер ${miner.name}!`,
    balance: user.balance - miner.price,
    mining_power: user.mining_power + miner.power,
  }
}

// Функция для получения инвентаря пользователя
async function getUserMiners(userId) {
  const { data, error } = await supabase
    .from("user_miners")
    .select(`
      id,
      quantity,
      miners (
        id,
        name,
        power,
        price,
        description
      )
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error getting user miners:", error)
    return []
  }

  return data
}

// Обработчики команд бота
bot.start(async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (user) {
    ctx.reply(`Добро пожаловать в игру Майнинг, ${ctx.from.first_name}! Используйте /help для получения списка команд.`)
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
  `)
})

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
    miners.forEach((miner, index) => {
      message += `${index + 1}. ${miner.name}\n`
      message += `   Мощность: ${miner.power} монет/мин\n`
      message += `   Цена: ${miner.price} монет\n`
      message += `   Описание: ${miner.description}\n\n`
    })
    message += "Для покупки используйте команду /buy <номер>"
    ctx.reply(message)
  } else {
    ctx.reply("В магазине пока нет доступных майнеров.")
  }
})

bot.command("buy", async (ctx) => {
  const user = await registerUser(ctx.from.id, ctx.from.username)
  if (!user) {
    ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.")
    return
  }

  const args = ctx.message.text.split(" ")
  if (args.length < 2) {
    ctx.reply("Пожалуйста, укажите номер майнера. Например: /buy 2")
    return
  }

  const minerIndex = Number.parseInt(args[1]) - 1
  const miners = await getAvailableMiners()

  if (minerIndex < 0 || minerIndex >= miners.length) {
    ctx.reply("Неверный номер майнера. Используйте /shop для просмотра доступных майнеров.")
    return
  }

  const result = await buyMiner(user.id, miners[minerIndex].id)
  ctx.reply(result.message)

  if (result.success) {
    ctx.reply(
      `Ваш новый баланс: ${result.balance.toFixed(2)} монет\nМощность майнинга: ${result.mining_power.toFixed(2)} монет/мин`,
    )
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


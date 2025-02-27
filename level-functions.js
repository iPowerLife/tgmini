import { supabase } from "./supabaseClient"

// Функция для добавления опыта пользователю
async function addExperience(userId, amount) {
  // Получаем пользователя
  const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

  if (userError) {
    console.error("Error getting user:", userError)
    return { success: false, message: "Ошибка получения данных пользователя" }
  }

  // Добавляем опыт
  const newExp = user.experience + amount
  let newLevel = user.level
  let leveledUp = false
  let reward = 0

  // Проверяем, достаточно ли опыта для нового уровня
  if (newExp >= user.next_level_exp) {
    // Получаем информацию о следующем уровне
    const { data: nextLevel, error: levelError } = await supabase
      .from("levels")
      .select("*")
      .eq("level", user.level + 1)
      .single()

    if (!levelError && nextLevel) {
      newLevel = user.level + 1
      leveledUp = true
      reward = nextLevel.reward

      // Получаем требования для следующего уровня
      const { data: nextNextLevel } = await supabase
        .from("levels")
        .select("*")
        .eq("level", newLevel + 1)
        .single()

      // Обновляем пользователя
      const { error: updateError } = await supabase
        .from("users")
        .update({
          level: newLevel,
          experience: newExp,
          next_level_exp: nextNextLevel ? nextNextLevel.exp_required : user.next_level_exp * 2,
          balance: user.balance + reward,
        })
        .eq("id", userId)

      if (updateError) {
        console.error("Error updating user level:", updateError)
        return { success: false, message: "Ошибка обновления уровня" }
      }

      // Записываем транзакцию для награды
      if (reward > 0) {
        await supabase.from("transactions").insert([
          {
            user_id: userId,
            amount: reward,
            type: "level_reward",
            description: `Награда за достижение ${newLevel} уровня`,
          },
        ])
      }
    }
  } else {
    // Просто обновляем опыт
    const { error: updateError } = await supabase
      .from("users")
      .update({
        experience: newExp,
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating user experience:", updateError)
      return { success: false, message: "Ошибка обновления опыта" }
    }
  }

  return {
    success: true,
    leveledUp,
    newLevel,
    newExp,
    reward,
    nextLevelExp: leveledUp
      ? (await supabase.from("users").select("next_level_exp").eq("id", userId).single()).data.next_level_exp
      : user.next_level_exp,
  }
}

// Модифицируем функцию майнинга для добавления опыта
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

  // Рассчитываем полученный опыт (10% от добытых монет)
  const expGained = Math.floor(minedCoins * 0.1)

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

  // Добавляем опыт
  const expResult = await addExperience(userId, expGained)

  let message = `Вы добыли ${minedCoins.toFixed(2)} монет и получили ${expGained} опыта!`

  if (expResult.leveledUp) {
    message += `\n\n🎉 Поздравляем! Вы достигли ${expResult.newLevel} уровня и получили награду ${expResult.reward} монет!`
  }

  return {
    success: true,
    message: message,
    balance: user.balance + minedCoins,
    experience: expResult.newExp,
    level: expResult.newLevel,
    leveledUp: expResult.leveledUp,
    nextLevelExp: expResult.nextLevelExp,
  }
}

// Экспортируем функции
export { addExperience, mineCoins }


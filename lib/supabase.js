import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Функция майнинга
export async function mineCoins(userId) {
  try {
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) throw userError

    const lastMining = new Date(user.last_mining)
    const now = new Date()
    const diffMinutes = (now - lastMining) / (1000 * 60)

    if (diffMinutes < 1) {
      return {
        success: false,
        message: `Подождите ещё ${Math.ceil(60 - diffMinutes * 60)} секунд`,
      }
    }

    const minedAmount = user.mining_power
    const newBalance = user.balance + minedAmount

    const { error: updateError } = await supabase
      .from("users")
      .update({
        balance: newBalance,
        last_mining: now.toISOString(),
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

    // Добавляем опыт за майнинг
    const expGained = Math.floor(minedAmount * 0.1)
    await addExperience(userId, expGained)

    return {
      success: true,
      message: `Вы добыли ${minedAmount.toFixed(2)} монет и получили ${expGained} опыта!`,
      balance: newBalance,
    }
  } catch (error) {
    console.error("Error in mineCoins:", error)
    return { success: false, message: "Произошла ошибка при майнинге" }
  }
}

// Функция добавления опыта
export async function addExperience(userId, amount) {
  try {
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) throw userError

    const newExp = user.experience + amount
    let newLevel = user.level
    let leveledUp = false
    let reward = 0

    if (newExp >= user.next_level_exp) {
      const { data: nextLevel } = await supabase
        .from("levels")
        .select("*")
        .eq("level", user.level + 1)
        .single()

      if (nextLevel) {
        newLevel = user.level + 1
        leveledUp = true
        reward = nextLevel.reward

        const { data: nextNextLevel } = await supabase
          .from("levels")
          .select("*")
          .eq("level", newLevel + 1)
          .single()

        await supabase
          .from("users")
          .update({
            level: newLevel,
            experience: newExp,
            next_level_exp: nextNextLevel ? nextNextLevel.exp_required : user.next_level_exp * 2,
            balance: user.balance + reward,
          })
          .eq("id", userId)

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
      await supabase
        .from("users")
        .update({
          experience: newExp,
        })
        .eq("id", userId)
    }

    return {
      success: true,
      leveledUp,
      newLevel,
      newExp,
      reward,
    }
  } catch (error) {
    console.error("Error in addExperience:", error)
    return { success: false }
  }
}

// Функция получения списка доступных майнеров
export async function getAvailableMiners() {
  try {
    const { data: miners, error } = await supabase.from("miners").select("*").order("price", { ascending: true })

    if (error) throw error
    return miners
  } catch (error) {
    console.error("Error getting miners:", error)
    return []
  }
}

// Функция покупки майнера
export async function buyMiner(userId, minerId) {
  try {
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) throw userError

    const { data: miner, error: minerError } = await supabase.from("miners").select("*").eq("id", minerId).single()

    if (minerError) throw minerError

    if (user.balance < miner.price) {
      return {
        success: false,
        message: "Недостаточно средств для покупки",
      }
    }

    const newBalance = user.balance - miner.price
    const newMiningPower = user.mining_power + miner.power

    const { error: updateError } = await supabase
      .from("users")
      .update({
        balance: newBalance,
        mining_power: newMiningPower,
      })
      .eq("id", userId)

    if (updateError) throw updateError

    await supabase.from("user_miners").insert([
      {
        user_id: userId,
        miner_id: minerId,
        quantity: 1,
      },
    ])

    await supabase.from("transactions").insert([
      {
        user_id: userId,
        amount: -miner.price,
        type: "purchase",
        description: `Куплен майнер ${miner.name}`,
      },
    ])

    return {
      success: true,
      message: `Вы успешно купили ${miner.name}!`,
      balance: newBalance,
      mining_power: newMiningPower,
    }
  } catch (error) {
    console.error("Error buying miner:", error)
    return {
      success: false,
      message: "Произошла ошибка при покупке майнера",
    }
  }
}


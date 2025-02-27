import { supabase } from "../supabase"

export async function getUser(telegramId) {
  console.log("Fetching user with telegram_id:", telegramId)

  try {
    const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

    if (error) {
      console.error("Error fetching user:", error)
      return null
    }

    console.log("Fetched user data:", data)
    return data
  } catch (error) {
    console.error("Error in getUser:", error)
    return null
  }
}

export async function createUser(telegramId, username) {
  console.log("Creating new user:", { telegramId, username })

  try {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          telegram_id: telegramId,
          username: username,
          balance: 0,
          mining_power: 1,
          level: 1,
          experience: 0,
          next_level_exp: 100,
          last_mining: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating user:", error)
      throw error
    }

    console.log("Created user:", data)
    return data
  } catch (error) {
    console.error("Error in createUser:", error)
    throw error
  }
}

export async function updateUserBalance(userId, amount) {
  console.log("Updating user balance:", { userId, amount })

  try {
    const { data, error } = await supabase.rpc("update_user_balance", {
      user_id_param: userId,
      amount_param: amount,
    })

    if (error) {
      console.error("Error updating balance:", error)
      throw error
    }

    console.log("Balance updated:", data)
    return data
  } catch (error) {
    console.error("Error in updateUserBalance:", error)
    throw error
  }
}

export async function logTransaction(userId, amount, type, description) {
  console.log("Logging transaction:", { userId, amount, type, description })

  try {
    const { error } = await supabase.from("transactions").insert([
      {
        user_id: userId,
        amount: amount,
        type: type,
        description: description,
      },
    ])

    if (error) {
      console.error("Error logging transaction:", error)
      throw error
    }

    console.log("Transaction logged successfully")
  } catch (error) {
    console.error("Error in logTransaction:", error)
    throw error
  }
}


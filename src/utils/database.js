import { supabase } from "../supabase"

export async function getUser(telegramId) {
  console.log("Fetching user with telegram_id:", telegramId)

  const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  console.log("Fetched user data:", data)
  return data
}

export async function createUser(telegramId, username) {
  console.log("Creating new user:", { telegramId, username })

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
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  console.log("Created user:", data)
  return data
}

export async function updateUser(userId, updates) {
  console.log("Updating user:", { userId, updates })

  const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating user:", error)
    return null
  }

  console.log("Updated user:", data)
  return data
}

export async function logTransaction(userId, amount, type, description) {
  console.log("Logging transaction:", { userId, amount, type, description })

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
  } else {
    console.log("Transaction logged successfully")
  }
}


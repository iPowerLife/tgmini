import { supabase } from "../supabase"

export async function getUser(telegramId) {
  const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

export async function createUser(telegramId, username) {
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

  return data
}

export async function updateUser(userId, updates) {
  const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating user:", error)
    return null
  }

  return data
}

export async function logTransaction(userId, amount, type, description) {
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
  }
}


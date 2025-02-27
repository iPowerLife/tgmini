import { supabase } from "../supabase"

export async function getShopItems() {
  try {
    console.log("Fetching shop items...")

    const { data: items, error } = await supabase.from("shop_items").select("*").order("price", { ascending: true })

    if (error) {
      console.error("Error fetching shop items:", error)
      throw error
    }

    console.log("Fetched shop items:", items)
    return items || []
  } catch (error) {
    console.error("Error in getShopItems:", error)
    return []
  }
}

export async function getUserItems(userId) {
  try {
    console.log("Fetching user items for user:", userId)

    const { data: items, error } = await supabase.from("user_items").select("*").eq("user_id", userId)

    if (error) {
      console.error("Error fetching user items:", error)
      throw error
    }

    console.log("Fetched user items:", items)
    return items || []
  } catch (error) {
    console.error("Error in getUserItems:", error)
    return []
  }
}

export async function purchaseItem(userId, item, currentBalance) {
  try {
    console.log("Attempting to purchase item:", {
      userId,
      item,
      currentBalance,
    })

    // Проверяем, достаточно ли денег
    if (currentBalance < item.price) {
      throw new Error("Недостаточно средств")
    }

    // Проверяем, не куплен ли уже предмет
    const { data: existingItem } = await supabase
      .from("user_items")
      .select("quantity")
      .eq("user_id", userId)
      .eq("item_id", item.id)
      .single()

    if (existingItem?.quantity >= item.max_quantity) {
      throw new Error("Достигнуто максимальное количество")
    }

    console.log("Purchase checks passed, proceeding with transaction")

    // Начинаем транзакцию
    // 1. Списываем деньги и увеличиваем мощность
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        balance: currentBalance - item.price,
        mining_power: supabase.raw(`mining_power + ${item.power_boost}`),
      })
      .eq("id", userId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating user:", updateError)
      throw updateError
    }

    // 2. Добавляем предмет пользователю
    const { error: purchaseError } = await supabase.from("user_items").insert([
      {
        user_id: userId,
        item_id: item.id,
        quantity: 1,
      },
    ])

    if (purchaseError) {
      console.error("Error recording purchase:", purchaseError)
      throw purchaseError
    }

    // 3. Логируем транзакцию
    const { error: transactionError } = await supabase.from("transactions").insert([
      {
        user_id: userId,
        amount: -item.price,
        type: "purchase",
        description: `Покупка предмета "${item.name}"`,
      },
    ])

    if (transactionError) {
      console.error("Error logging transaction:", transactionError)
      throw transactionError
    }

    console.log("Purchase completed successfully:", updatedUser)
    return updatedUser
  } catch (error) {
    console.error("Error in purchaseItem:", error)
    throw error
  }
}


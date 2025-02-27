import { supabase } from "../supabase"

export async function getShopItems() {
  try {
    console.log("Fetching shop items...")

    // Получаем все предметы из магазина, сортируем по цене
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

    // Получаем все предметы пользователя
    const { data: items, error } = await supabase
      .from("user_items")
      .select(`
        *,
        shop_items (*)
      `)
      .eq("user_id", userId)

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

export async function purchaseItem(userId, item, userBalance) {
  try {
    console.log("Purchasing item:", { userId, item, userBalance })

    if (userBalance < item.price) {
      throw new Error("Недостаточно средств")
    }

    // Проверяем, есть ли у пользователя уже этот предмет
    const { data: existingItem, error: existingItemError } = await supabase
      .from("user_items")
      .select("*")
      .eq("user_id", userId)
      .eq("item_id", item.id)
      .single()

    if (existingItemError && existingItemError.code !== "PGRST116") {
      console.error("Error checking existing item:", existingItemError)
      throw existingItemError
    }

    if (existingItem) {
      // Если предмет уже есть, увеличиваем количество
      if (existingItem.quantity >= item.max_quantity) {
        throw new Error("Достигнуто максимальное количество для этого предмета")
      }

      const { data: updatedItem, error: updateError } = await supabase
        .from("user_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("user_id", userId)
        .eq("item_id", item.id)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating item quantity:", updateError)
        throw updateError
      }

      console.log("Updated item quantity:", updatedItem)
    } else {
      // Если предмета нет, добавляем новую запись
      const { data: newItem, error: insertError } = await supabase
        .from("user_items")
        .insert([{ user_id: userId, item_id: item.id }])
        .select()
        .single()

      if (insertError) {
        console.error("Error inserting new item:", insertError)
        throw insertError
      }

      console.log("Inserted new item:", newItem)
    }

    // Обновляем баланс пользователя и мощность майнинга
    const newBalance = userBalance - item.price
    const { data: updatedUser, error: userError } = await supabase
      .from("users")
      .update({
        balance: newBalance,
        mining_power: Number.parseFloat(user.mining_power) + Number.parseFloat(item.power_boost),
      })
      .eq("id", userId)
      .select()
      .single()

    if (userError) {
      console.error("Error updating user balance:", userError)
      throw userError
    }

    console.log("Updated user balance:", updatedUser)

    return updatedUser
  } catch (error) {
    console.error("Error in purchaseItem:", error)
    throw error
  }
}


import { supabase } from "../supabase"
import { updateUser } from "./database"

export async function getShopItems() {
  try {
    console.log("Fetching shop items...")

    // Проверяем подключение
    const { data: testData, error: testError } = await supabase.from("shop_items").select("count").single()

    if (testError) {
      console.error("Shop items connection test failed:", testError)
      throw new Error("Ошибка подключения к магазину")
    }

    console.log("Shop items connection test:", testData)

    // Получаем все предметы
    const { data: items, error } = await supabase.from("shop_items").select("*").order("price", { ascending: true })

    if (error) {
      console.error("Error fetching shop items:", error)
      throw error
    }

    if (!items || items.length === 0) {
      console.warn("No shop items found in database")
      return []
    }

    console.log("Successfully fetched shop items:", items)
    return items
  } catch (error) {
    console.error("Error in getShopItems:", error)
    throw new Error(`Ошибка загрузки предметов: ${error.message}`)
  }
}

export async function getUserItems(userId) {
  try {
    console.log("Fetching user items for user:", userId)

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

    console.log("Successfully fetched user items:", items)
    return items || []
  } catch (error) {
    console.error("Error in getUserItems:", error)
    throw new Error(`Ошибка загрузки инвентаря: ${error.message}`)
  }
}

export async function purchaseItem(userId, item, currentBalance) {
  try {
    console.log(`Attempting to purchase item ${item.name} for user ${userId}`)

    if (currentBalance < item.price) {
      throw new Error("Недостаточно средств")
    }

    // Проверяем, есть ли уже этот предмет у пользователя
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

      console.log("Item quantity updated:", updatedItem)
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

      console.log("New item inserted:", newItem)
    }

    // Обновляем баланс пользователя
    const updatedBalance = currentBalance - item.price
    const updatedUser = await updateUser(userId, { balance: updatedBalance })

    console.log("Purchase successful, updated user:", updatedUser)
    return updatedUser
  } catch (error) {
    console.error("Error in purchaseItem:", error)
    throw new Error(`Ошибка при покупке предмета: ${error.message}`)
  }
}


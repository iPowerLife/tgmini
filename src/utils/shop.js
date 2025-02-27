import { supabase } from "../supabase"

export async function getShopItems() {
  try {
    console.log("Fetching shop items...")

    // Проверяем подключение к базе данных
    const { data: testData, error: testError } = await supabase.from("shop_items").select("count").single()

    if (testError) {
      console.error("Shop items connection test failed:", testError)
      throw new Error(`Ошибка подключения к магазину: ${testError.message}`)
    }

    console.log("Shop items connection test:", testData)

    // Получаем все предметы из магазина
    const { data: items, error } = await supabase.from("shop_items").select("*").order("price", { ascending: true })

    if (error) {
      console.error("Error fetching shop items:", error)
      throw new Error(`Ошибка загрузки предметов: ${error.message}`)
    }

    if (!items || items.length === 0) {
      console.warn("No shop items found in database")
      throw new Error("Предметы магазина не найдены")
    }

    console.log("Successfully fetched shop items:", items)
    return items
  } catch (error) {
    console.error("Error in getShopItems:", error)
    throw error
  }
}

export async function getUserItems(userId) {
  try {
    console.log("Fetching user items for user:", userId)

    const { data: items, error } = await supabase.from("user_items").select("*, shop_items(*)").eq("user_id", userId)

    if (error) {
      console.error("Error fetching user items:", error)
      throw new Error(`Ошибка загрузки инвентаря: ${error.message}`)
    }

    console.log("Successfully fetched user items:", items)
    return items || []
  } catch (error) {
    console.error("Error in getUserItems:", error)
    throw error
  }
}


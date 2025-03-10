import { supabase } from "../supabase"
import { sendTelegramMessage } from "./telegram-bot"

/**
 * Регистрирует пользователя в системе уведомлений
 * @param {Object} user - Объект пользователя Telegram
 * @returns {Promise<Object>} - Результат операции
 */
export async function registerBotUser(user) {
  if (!user || !user.id) {
    console.error("Invalid user object:", user)
    return { success: false, error: "Invalid user object" }
  }

  try {
    // Проверяем, существует ли пользователь
    const { data: existingUser, error: checkError } = await supabase
      .from("bot_users")
      .select("id")
      .eq("telegram_id", user.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking bot user:", checkError)
      return { success: false, error: checkError.message }
    }

    if (existingUser) {
      // Обновляем информацию о пользователе
      const { error: updateError } = await supabase
        .from("bot_users")
        .update({
          first_name: user.first_name,
          username: user.username,
          last_active: new Date().toISOString(),
        })
        .eq("telegram_id", user.id)

      if (updateError) {
        console.error("Error updating bot user:", updateError)
        return { success: false, error: updateError.message }
      }

      return { success: true, user: existingUser }
    } else {
      // Создаем нового пользователя
      const { data: newUser, error: insertError } = await supabase
        .from("bot_users")
        .insert({
          telegram_id: user.id,
          first_name: user.first_name,
          username: user.username,
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error creating bot user:", insertError)
        return { success: false, error: insertError.message }
      }

      return { success: true, user: newUser }
    }
  } catch (error) {
    console.error("Error registering bot user:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Создает новое уведомление для отправки всем пользователям
 * @param {string} title - Заголовок уведомления
 * @param {string} message - Текст уведомления
 * @returns {Promise<Object>} - Результат операции
 */
export async function createNotification(title, message) {
  try {
    // Получаем количество пользователей
    const { count, error: countError } = await supabase.from("bot_users").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error counting bot users:", countError)
      return { success: false, error: countError.message }
    }

    // Создаем уведомление
    const { data: notification, error: createError } = await supabase
      .from("notifications")
      .insert({
        title,
        message,
        status: "pending",
        total_count: count || 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating notification:", createError)
      return { success: false, error: createError.message }
    }

    return { success: true, notification }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Отправляет уведомление всем пользователям
 * @param {string} notificationId - ID уведомления
 * @param {number} batchSize - Размер пакета для отправки
 * @returns {Promise<Object>} - Результат операции
 */
export async function sendNotification(notificationId, batchSize = 10) {
  try {
    // Получаем информацию об уведомлении
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .single()

    if (notificationError) {
      console.error("Error fetching notification:", notificationError)
      return { success: false, error: notificationError.message }
    }

    // Обновляем статус уведомления
    await supabase.from("notifications").update({ status: "sending" }).eq("id", notificationId)

    // Получаем всех пользователей
    const { data: users, error: usersError } = await supabase.from("bot_users").select("telegram_id, first_name")

    if (usersError) {
      console.error("Error fetching bot users:", usersError)
      return { success: false, error: usersError.message }
    }

    // Создаем записи статусов для всех пользователей
    const statusRecords = users.map((user) => ({
      notification_id: notificationId,
      telegram_id: user.telegram_id,
      status: "pending",
      created_at: new Date().toISOString(),
    }))

    // Вставляем записи статусов
    const { error: statusError } = await supabase.from("notification_statuses").insert(statusRecords)

    if (statusError) {
      console.error("Error creating notification statuses:", statusError)
      return { success: false, error: statusError.message }
    }

    // Отправляем уведомления пакетами
    let sentCount = 0
    let failedCount = 0

    // Формируем HTML-сообщение
    const htmlMessage = `
<b>${notification.title}</b>

${notification.message}
`

    // Отправляем сообщения пакетами
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)

      // Отправляем сообщения параллельно
      const results = await Promise.all(
        batch.map(async (user) => {
          try {
            await sendTelegramMessage(user.telegram_id, htmlMessage)

            // Обновляем статус отправки
            await supabase
              .from("notification_statuses")
              .update({
                status: "sent",
                sent_at: new Date().toISOString(),
              })
              .eq("notification_id", notificationId)
              .eq("telegram_id", user.telegram_id)

            return { success: true, telegram_id: user.telegram_id }
          } catch (error) {
            console.error(`Error sending notification to ${user.telegram_id}:`, error)

            // Обновляем статус отправки
            await supabase
              .from("notification_statuses")
              .update({
                status: "failed",
                error: error.message,
              })
              .eq("notification_id", notificationId)
              .eq("telegram_id", user.telegram_id)

            return { success: false, telegram_id: user.telegram_id, error: error.message }
          }
        }),
      )

      // Подсчитываем результаты
      results.forEach((result) => {
        if (result.success) {
          sentCount++
        } else {
          failedCount++
        }
      })

      // Обновляем счетчик отправленных сообщений
      await supabase.from("notifications").update({ sent_count: sentCount }).eq("id", notificationId)

      // Делаем паузу между пакетами, чтобы не превысить лимиты API
      if (i + batchSize < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // Обновляем статус уведомления
    await supabase
      .from("notifications")
      .update({
        status: "completed",
        sent_count: sentCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", notificationId)

    return {
      success: true,
      stats: {
        total: users.length,
        sent: sentCount,
        failed: failedCount,
      },
    }
  } catch (error) {
    console.error("Error sending notification:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Получает список всех уведомлений
 * @returns {Promise<Object>} - Результат операции
 */
export async function getNotifications() {
  try {
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching notifications:", error)
      return { success: false, error: error.message }
    }

    return { success: true, notifications: data }
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Получает детальную информацию об уведомлении
 * @param {string} notificationId - ID уведомления
 * @returns {Promise<Object>} - Результат операции
 */
export async function getNotificationDetails(notificationId) {
  try {
    // Получаем информацию об уведомлении
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .single()

    if (notificationError) {
      console.error("Error fetching notification:", notificationError)
      return { success: false, error: notificationError.message }
    }

    // Получаем статистику отправки
    const { data: statuses, error: statusesError } = await supabase
      .from("notification_statuses")
      .select(`
        status,
        error,
        sent_at,
        bot_users (
          telegram_id,
          first_name,
          username
        )
      `)
      .eq("notification_id", notificationId)

    if (statusesError) {
      console.error("Error fetching notification statuses:", statusesError)
      return { success: false, error: statusesError.message }
    }

    // Группируем статусы по статусу отправки
    const statusGroups = {
      sent: statuses.filter((s) => s.status === "sent").length,
      failed: statuses.filter((s) => s.status === "failed").length,
      pending: statuses.filter((s) => s.status === "pending").length,
    }

    return {
      success: true,
      notification,
      statuses,
      stats: statusGroups,
    }
  } catch (error) {
    console.error("Error fetching notification details:", error)
    return { success: false, error: error.message }
  }
}


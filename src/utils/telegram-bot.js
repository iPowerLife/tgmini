// Утилита для работы с Telegram Bot API
const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN

/**
 * Проверяет, может ли бот отправлять сообщения пользователю
 * @param {number} chatId - ID чата/пользователя в Telegram
 * @returns {Promise<boolean>} - true, если бот может отправлять сообщения
 */
export async function canBotMessageUser(chatId) {
  try {
    const { canMessage } = await checkBotStatus(chatId)
    return canMessage
  } catch (error) {
    console.error("Error checking if bot can message user:", error)
    return false
  }
}

/**
 * Проверяет статус бота и его возможность отправлять сообщения
 * @param {number} chatId - ID чата/пользователя в Telegram
 * @returns {Promise<{canMessage: boolean, error?: string}>}
 */
export async function checkBotStatus(chatId) {
  try {
    // Проверяем, что токен существует
    if (!TELEGRAM_BOT_TOKEN) {
      return {
        canMessage: false,
        error: "BOT_TOKEN_MISSING",
      }
    }

    const numericChatId = Number(chatId)
    if (isNaN(numericChatId)) {
      return {
        canMessage: false,
        error: "INVALID_CHAT_ID",
      }
    }

    // Проверяем статус бота через getChat
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: numericChatId,
      }),
    })

    const data = await response.json()
    console.log("Bot status check response:", data)

    if (!data.ok) {
      return {
        canMessage: false,
        error: data.description || "TELEGRAM_API_ERROR",
      }
    }

    return { canMessage: true }
  } catch (error) {
    console.error("Error checking bot status:", error)
    return {
      canMessage: false,
      error: "NETWORK_ERROR",
    }
  }
}

/**
 * Отправляет сообщение пользователю через Telegram Bot API
 * @param {number} chatId - ID чата/пользователя в Telegram
 * @param {string} text - Текст сообщения
 * @param {Object} options - Дополнительные опции
 * @returns {Promise<Object>} - Ответ от Telegram API
 */
export async function sendTelegramMessage(chatId, text, options = {}) {
  try {
    console.log(`Attempting to send message to chat ID: ${chatId}`)

    // Сначала проверяем статус бота
    const { canMessage, error } = await checkBotStatus(chatId)

    if (!canMessage) {
      console.error(`Cannot send message to ${chatId}. Error:`, error)
      throw new Error(error)
    }

    const requestBody = {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
      ...options,
    }

    console.log("Request body:", JSON.stringify(requestBody))

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()
    console.log("Telegram API response:", data)

    if (!data.ok) {
      // Обрабатываем специфические ошибки Telegram
      if (data.error_code === 403) {
        throw new Error("BOT_BLOCKED")
      }
      if (data.error_code === 400 && data.description.includes("chat not found")) {
        throw new Error("CHAT_NOT_FOUND")
      }
      throw new Error(data.description || "TELEGRAM_API_ERROR")
    }

    console.log("Message sent successfully to", chatId)
    return data.result
  } catch (error) {
    console.error("Error sending Telegram message:", error)
    throw error
  }
}

/**
 * Тестирует отправку сообщения и возвращает понятную ошибку
 * @param {number} chatId - ID чата/пользователя в Telegram
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function testSendMessage(chatId) {
  try {
    const result = await sendTelegramMessage(
      chatId,
      "<b>🔔 Тестовое сообщение</b>\n\nЕсли вы видите это сообщение, значит уведомления работают правильно!",
    )

    return {
      success: true,
      message: "Тестовое сообщение успешно отправлено!",
    }
  } catch (error) {
    console.error("Test message error:", error)

    // Возвращаем понятное пользователю сообщение об ошибке
    let userMessage = "Не удалось отправить тестовое сообщение. "

    switch (error.message) {
      case "BOT_TOKEN_MISSING":
        userMessage += "Ошибка конфигурации бота."
        break
      case "INVALID_CHAT_ID":
        userMessage += "Неверный ID пользователя."
        break
      case "BOT_BLOCKED":
        userMessage += "Бот заблокирован пользователем."
        break
      case "CHAT_NOT_FOUND":
        userMessage +=
          "Для получения уведомлений, пожалуйста:\n1. Перейдите к боту @trteeeeeee_bot\n2. Отправьте команду /start\n3. Попробуйте снова"
        break
      default:
        userMessage += "Произошла неизвестная ошибка. Пожалуйста, попробуйте позже."
    }

    return {
      success: false,
      message: userMessage,
    }
  }
}


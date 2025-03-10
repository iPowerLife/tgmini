// Утилита для работы с Telegram Bot API
const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === "true"

/**
 * Проверяет формат токена бота
 * @param {string} token - Токен для проверки
 * @returns {boolean}
 */
function isValidTokenFormat(token) {
  // Токен должен соответствовать формату: число:строка
  return /^\d+:[A-Za-z0-9_-]+$/.test(token)
}

/**
 * Проверяет валидность токена бота
 * @returns {Promise<{isValid: boolean, botInfo?: Object, error?: string}>}
 */
async function validateBotToken() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is not defined")
    return {
      isValid: false,
      error: "Token is not defined in environment variables",
    }
  }

  if (!isValidTokenFormat(TELEGRAM_BOT_TOKEN)) {
    console.error("TELEGRAM_BOT_TOKEN has invalid format")
    return {
      isValid: false,
      error: "Invalid token format",
    }
  }

  try {
    console.log("Validating bot token...")
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
    const data = await response.json()

    if (!data.ok) {
      console.error("Invalid bot token:", data.description)
      return {
        isValid: false,
        error: data.description,
      }
    }

    console.log("Bot token validated successfully for bot:", data.result.username)
    return {
      isValid: true,
      botInfo: data.result,
    }
  } catch (error) {
    console.error("Error validating bot token:", error)
    return {
      isValid: false,
      error: error.message,
    }
  }
}

/**
 * Тестирует отправку сообщения и возвращает понятную ошибку
 * @param {number} chatId - ID чата/пользователя в Telegram
 * @returns {Promise<{success: boolean, message: string, debug?: Object}>}
 */
export async function testSendMessage(chatId) {
  try {
    // Проверяем валидность токена
    const validation = await validateBotToken()

    if (!validation.isValid) {
      const debugInfo = DEBUG_MODE
        ? {
            error: validation.error,
            tokenExists: !!TELEGRAM_BOT_TOKEN,
            tokenFormat: isValidTokenFormat(TELEGRAM_BOT_TOKEN),
            tokenPrefix: TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.split(":")[0] : null,
          }
        : undefined

      return {
        success: false,
        message: "Ошибка конфигурации бота. Пожалуйста, обратитесь к администратору.",
        debug: debugInfo,
      }
    }

    const result = await sendTelegramMessage(
      chatId,
      "<b>🔔 Тестовое сообщение</b>\n\nЕсли вы видите это сообщение, значит уведомления работают правильно!",
    )

    return {
      success: true,
      message: "Тестовое сообщение успешно отправлено!",
      debug: DEBUG_MODE
        ? {
            botInfo: validation.botInfo,
            messageResult: result,
          }
        : undefined,
    }
  } catch (error) {
    console.error("Test message error:", error)

    const debugInfo = DEBUG_MODE
      ? {
          error: error.message,
          stack: error.stack,
          chatId: chatId,
        }
      : undefined

    // Возвращаем понятное пользователю сообщение об ошибке
    let userMessage = "Не удалось отправить тестовое сообщение. "

    switch (error.message) {
      case "BOT_TOKEN_INVALID":
        userMessage += "Ошибка конфигурации бота. Пожалуйста, обратитесь к администратору."
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
      debug: debugInfo,
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

    // Проверяем валидность токена
    const validation = await validateBotToken()
    if (!validation.isValid) {
      throw new Error(`BOT_TOKEN_INVALID: ${validation.error}`)
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

// Экспортируем функцию для проверки возможности отправки сообщений
export async function canBotMessageUser(chatId) {
  try {
    const validation = await validateBotToken()
    if (!validation.isValid) {
      return false
    }

    const numericChatId = Number(chatId)
    if (isNaN(numericChatId)) {
      return false
    }

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
    return data.ok
  } catch (error) {
    console.error("Error checking if bot can message user:", error)
    return false
  }
}


// Утилита для работы с Telegram Bot API
const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN

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

    // Убедитесь, что chatId - это число, а не строка
    const numericChatId = Number(chatId)

    if (isNaN(numericChatId)) {
      console.error(`Invalid chat ID: ${chatId} is not a number`)
      return null
    }

    console.log(`Using token: ${TELEGRAM_BOT_TOKEN ? "Token exists" : "Token is missing"}`)

    if (!TELEGRAM_BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN is not defined")
      return null
    }

    const requestBody = {
      chat_id: numericChatId,
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
      console.error("Error sending Telegram message:", data.description)
      return null
    }

    console.log("Message sent successfully to", numericChatId)
    return data.result
  } catch (error) {
    console.error("Error sending Telegram message:", error)
    return null
  }
}

// Функция для проверки, может ли бот отправлять сообщения пользователю
export async function canBotMessageUser(chatId) {
  try {
    const numericChatId = Number(chatId)

    if (isNaN(numericChatId)) {
      return false
    }

    if (!TELEGRAM_BOT_TOKEN) {
      return false
    }

    // Отправляем запрос getChat для проверки доступа к пользователю
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

    // Если запрос успешен, значит бот имеет доступ к чату
    return data.ok
  } catch (error) {
    console.error("Error checking bot access:", error)
    return false
  }
}

// Тестовая функция для проверки отправки сообщений
export async function testSendMessage(chatId) {
  // Сначала проверяем, может ли бот отправлять сообщения
  const canMessage = await canBotMessageUser(chatId)

  if (!canMessage) {
    console.error(`Bot cannot send messages to user ${chatId}. User may need to start the bot first.`)
    return null
  }

  const result = await sendTelegramMessage(
    chatId,
    "<b>Тестовое сообщение</b>\n\nЕсли вы видите это сообщение, значит бот настроен правильно.",
  )
  return result
}


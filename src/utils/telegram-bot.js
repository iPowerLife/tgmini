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
    console.log(`Using token: ${TELEGRAM_BOT_TOKEN ? "Token exists" : "Token is missing"}`)

    if (!TELEGRAM_BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN is not defined")
      return null
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
      console.error("Error sending Telegram message:", data.description)
      return null
    }

    console.log("Message sent successfully to", chatId)
    return data.result
  } catch (error) {
    console.error("Error sending Telegram message:", error)
    return null
  }
}


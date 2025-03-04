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
    if (!TELEGRAM_BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN is not defined")
      return null
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
        ...options,
      }),
    })

    const data = await response.json()

    if (!data.ok) {
      console.error("Error sending Telegram message:", data.description)
      return null
    }

    return data.result
  } catch (error) {
    console.error("Error sending Telegram message:", error)
    return null
  }
}


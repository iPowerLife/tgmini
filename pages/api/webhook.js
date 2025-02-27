import { Telegraf } from "telegraf"

const bot = new Telegraf(process.env.BOT_TOKEN)

export default async function handler(req, res) {
  try {
    // Обработка webhook от Telegram
    if (req.method === "POST") {
      await bot.handleUpdate(req.body)
      res.status(200).json({ ok: true })
    } else {
      // Отвечаем на GET запросы (для проверки работоспособности)
      res.status(200).json({ status: "Bot webhook is running" })
    }
  } catch (error) {
    console.error("Webhook error:", error)
    res.status(500).json({ error: "Failed to process webhook" })
  }
}


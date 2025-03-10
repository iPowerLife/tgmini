import { updateCachedRatings } from "../../utils/rating-updater"

export default async function handler(req, res) {
  // Проверяем метод запроса
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" })
  }

  // Проверяем секретный ключ для безопасности
  const { secret } = req.body

  if (secret !== process.env.RATINGS_UPDATE_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    // Обновляем рейтинг
    const result = await updateCachedRatings()

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to update ratings",
        error: result.error,
      })
    }

    return res.status(200).json({
      success: true,
      message: "Ratings updated successfully",
      data: result.data,
    })
  } catch (error) {
    console.error("Error updating ratings:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    })
  }
}


const formatTimeRemaining = (endDate) => {
  if (!endDate) {
    console.log("No end_date provided")
    return "Нет времени"
  }

  try {
    const now = new Date()
    // Убедимся, что у нас правильный формат даты
    const end = new Date(endDate)

    // Проверим валидность даты
    if (isNaN(end.getTime())) {
      console.error("Invalid end_date:", endDate)
      return "Ошибка времени"
    }

    const diff = end - now

    if (diff <= 0) return "Время истекло"

    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    // Для отладки
    console.log("Time calculation:", {
      now: now.toISOString(),
      end: end.toISOString(),
      diff,
      hours,
      minutes,
      seconds,
    })

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  } catch (error) {
    console.error("Error formatting time:", error)
    return "Ошибка времени"
  }
}


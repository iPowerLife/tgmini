import { updateCachedRatings } from "../src/utils/rating-updater.js"

async function main() {
  console.log("Запуск обновления рейтинга...")

  try {
    const result = await updateCachedRatings()

    if (result.success) {
      console.log("Рейтинг успешно обновлен:", result.data)
      process.exit(0)
    } else {
      console.error("Ошибка при обновлении рейтинга:", result.error)
      process.exit(1)
    }
  } catch (error) {
    console.error("Критическая ошибка при обновлении рейтинга:", error)
    process.exit(1)
  }
}

main()


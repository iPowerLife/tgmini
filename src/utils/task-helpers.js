/**
 * Функция для определения категории задания по ID
 * @param {number} categoryId - ID категории
 * @returns {string} - Название категории
 */
export function getCategoryById(categoryId) {
  if (!categoryId) return "daily"

  const categoryMap = {
    1: "daily",
    2: "partners",
    3: "social",
  }

  return categoryMap[categoryId] || "daily"
}

/**
 * Функция для получения запасного изображения по категории задания
 * @param {Object} task - Объект задания
 * @returns {string} - URL запасного изображения
 */
export function getFallbackImage(task) {
  const category = task.category?.name || getCategoryById(task.category_id)

  switch (category) {
    case "daily":
      return "https://cdn-icons-png.flaticon.com/512/2991/2991195.png"
    case "partners":
      return "https://cdn-icons-png.flaticon.com/512/2991/2991112.png"
    case "social":
      return "https://cdn-icons-png.flaticon.com/512/2504/2504941.png"
    default:
      return "https://cdn-icons-png.flaticon.com/512/2991/2991195.png"
  }
}


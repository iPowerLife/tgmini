/**
 * Создает тестовые задания для демонстрации
 * @returns {Array} - Массив тестовых заданий
 */
export function createMockTasks() {
  return [
    // Daily tasks
    {
      id: 1,
      title: "Ежедневный бонус",
      description: "Получите ежедневный бонус",
      reward: 50,
      is_active: true,
      category_id: 1,
      category: { name: "daily", display_name: "Ежедневные" },
      icon_url: "https://cdn-icons-png.flaticon.com/512/2991/2991195.png",
    },
    {
      id: 2,
      title: "Посмотреть видео",
      description: "Посмотрите короткое видео",
      reward: 30,
      is_active: true,
      category_id: 1,
      category: { name: "daily", display_name: "Ежедневные" },
      icon_url: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
    },
    // Partners tasks
    {
      id: 3,
      title: "Установить приложение",
      description: "Установите партнерское приложение",
      reward: 100,
      is_active: true,
      category_id: 2,
      category: { name: "partners", display_name: "Партнеры" },
      icon_url: "https://cdn-icons-png.flaticon.com/512/2991/2991112.png",
    },
    // Social tasks
    {
      id: 4,
      title: "Подписаться на Telegram",
      description: "Подпишитесь на наш Telegram канал",
      reward: 60,
      is_active: true,
      category_id: 3,
      category: { name: "social", display_name: "Социальные" },
      icon_url: "https://cdn-icons-png.flaticon.com/512/2504/2504941.png",
    },
  ]
}


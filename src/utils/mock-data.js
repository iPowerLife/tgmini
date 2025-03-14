/**
 * Создает тестовые задания для отображения, когда не удается загрузить их из базы данных
 * @returns {Array} Массив тестовых заданий
 */
export function createMockTasks() {
  return [
    {
      id: 1,
      title: "Ежедневный бонус",
      description: "Получите ежедневный бонус за вход в игру",
      reward: 50,
      category: { name: "daily", display_name: "Ежедневные" },
      icon_url: "https://cdn-icons-png.flaticon.com/512/2991/2991195.png",
      is_completed: false,
      verification_time: 5,
    },
    {
      id: 2,
      title: "Пригласить друга",
      description: "Пригласите друга и получите бонус, когда он присоединится",
      reward: 100,
      category: { name: "social", display_name: "Социальные" },
      icon_url: "https://cdn-icons-png.flaticon.com/512/2504/2504941.png",
      is_completed: false,
      verification_time: 10,
    },
    {
      id: 3,
      title: "Посетить партнера",
      description: "Перейдите по ссылке партнера и получите награду",
      reward: 75,
      category: { name: "partners", display_name: "Партнеры" },
      icon_url: "https://cdn-icons-png.flaticon.com/512/2991/2991112.png",
      link: "https://t.me/example_channel",
      is_completed: false,
      verification_time: 15,
    },
    {
      id: 4,
      title: "Купить майнер",
      description: "Купите свой первый майнер в магазине",
      reward: 120,
      category: { name: "daily", display_name: "Ежедневные" },
      icon_url: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
      is_completed: false,
      verification_time: 5,
    },
    {
      id: 5,
      title: "Подписаться на канал",
      description: "Подпишитесь на наш официальный канал",
      reward: 80,
      category: { name: "social", display_name: "Социальные" },
      icon_url: "https://cdn-icons-png.flaticon.com/512/2504/2504903.png",
      link: "https://t.me/official_channel",
      is_completed: false,
      verification_time: 10,
    },
  ]
}

/**
 * Создает тестовые данные для майнеров
 * @returns {Array} Массив тестовых майнеров
 */
export function createMockMiners() {
  return [
    {
      id: 1,
      model: {
        id: 1,
        name: "basic_miner",
        display_name: "Базовый майнер",
        mining_power: 10,
        energy_consumption: 5,
      },
      quantity: 2,
      total_mined: 150.5,
    },
    {
      id: 2,
      model: {
        id: 2,
        name: "advanced_miner",
        display_name: "Продвинутый майнер",
        mining_power: 25,
        energy_consumption: 12,
      },
      quantity: 1,
      total_mined: 200.75,
    },
  ]
}

/**
 * Создает тестовые данные для рейтинга
 * @returns {Array} Массив пользователей для рейтинга
 */
export function createMockRating() {
  return [
    {
      id: 1,
      display_name: "Игрок 1",
      balance: 5000,
      mining_power: 150,
      level: 10,
    },
    {
      id: 2,
      display_name: "Игрок 2",
      balance: 3500,
      mining_power: 120,
      level: 8,
    },
    {
      id: 3,
      display_name: "Игрок 3",
      balance: 2800,
      mining_power: 90,
      level: 6,
    },
    {
      id: 4,
      display_name: "Игрок 4",
      balance: 1500,
      mining_power: 60,
      level: 4,
    },
    {
      id: 5,
      display_name: "Игрок 5",
      balance: 800,
      mining_power: 30,
      level: 2,
    },
  ]
}


/**
 * Создает дебаунсированную версию функции
 * @param {Function} func - Функция для дебаунса
 * @param {number} wait - Время ожидания в миллисекундах
 * @returns {Function} - Дебаунсированная функция
 */
export function debounce(func, wait = 300) {
  let timeout

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Создает тротлированную версию функции
 * @param {Function} func - Функция для тротлинга
 * @param {number} limit - Минимальный интервал между вызовами в миллисекундах
 * @returns {Function} - Тротлированная функция
 */
export function throttle(func, limit = 300) {
  let inThrottle

  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Измеряет время выполнения функции
 * @param {Function} func - Функция для измерения
 * @param {string} name - Название функции для логирования
 * @returns {Function} - Обернутая функция
 */
export function measurePerformance(func, name = "Function") {
  return (...args) => {
    const start = performance.now()
    const result = func(...args)
    const end = performance.now()

    console.log(`${name} took ${end - start} ms to execute`)

    return result
  }
}


import { fixImageUrl } from "./image-helpers"

// Глобальный кэш для хранения предзагруженных изображений
const imageCache = new Map()

/**
 * Проверяет, находится ли изображение в кэше
 * @param {string} src - URL изображения
 * @returns {boolean} - true, если изображение в кэше
 */
export function isImageCached(src) {
  const fixedSrc = fixImageUrl(src)
  return imageCache.has(fixedSrc)
}

/**
 * Получает изображение из кэша
 * @param {string} src - URL изображения
 * @returns {HTMLImageElement|null} - Элемент изображения или null
 */
export function getCachedImage(src) {
  const fixedSrc = fixImageUrl(src)
  return imageCache.get(fixedSrc) || null
}

/**
 * Предзагружает изображение и добавляет его в кэш
 * @param {string} src - URL изображения
 * @param {Object} options - Дополнительные опции
 * @param {string} options.fallbackSrc - Запасной URL, если основной не загрузится
 * @param {Function} options.onProgress - Колбэк для отслеживания прогресса
 * @returns {Promise<HTMLImageElement>} - Promise с элементом изображения
 */
export function preloadImage(src, options = {}) {
  return new Promise((resolve, reject) => {
    if (!src) {
      if (options.fallbackSrc) {
        return preloadImage(options.fallbackSrc, {
          onProgress: options.onProgress,
        })
          .then(resolve)
          .catch(reject)
      }
      reject(new Error("No source provided"))
      return
    }

    const fixedSrc = fixImageUrl(src)

    // Если изображение уже в кэше, сразу разрешаем Promise
    if (imageCache.has(fixedSrc)) {
      console.log(`Image already cached: ${fixedSrc}`)
      resolve(imageCache.get(fixedSrc))
      return
    }

    console.log(`Preloading image: ${fixedSrc}`)
    const img = new Image()
    img.crossOrigin = "anonymous" // Для предотвращения CORS-ошибок при использовании с canvas

    img.onload = () => {
      console.log(`Image loaded: ${fixedSrc}`)
      imageCache.set(fixedSrc, img)
      resolve(img)
    }

    img.onerror = () => {
      console.warn(`Failed to load image: ${fixedSrc}`)

      // Если есть запасной URL, пробуем его
      if (options.fallbackSrc) {
        preloadImage(options.fallbackSrc, {
          onProgress: options.onProgress,
        })
          .then(resolve)
          .catch(reject)
      } else {
        reject(new Error(`Failed to load image: ${fixedSrc}`))
      }
    }

    img.src = fixedSrc
  })
}

/**
 * Предзагружает массив изображений
 * @param {Array<string|Object>} sources - Массив URL изображений или объектов {src, fallbackSrc}
 * @param {Function} onProgress - Колбэк для отслеживания прогресса (получает число от 0 до 1)
 * @param {Object} options - Дополнительные опции
 * @param {number} options.concurrency - Количество одновременных загрузок (по умолчанию 5)
 * @returns {Promise<Array>} - Promise с массивом результатов
 */
export function preloadImages(sources, onProgress, options = {}) {
  if (!sources || sources.length === 0) {
    return Promise.resolve([])
  }

  const concurrency = options.concurrency || 5
  let loaded = 0
  const total = sources.length

  // Нормализуем источники
  const normalizedSources = sources.map((source) => (typeof source === "string" ? { src: source } : source))

  // Для отслеживания всех промисов
  const allPromises = []
  // Текущие активные промисы
  const activePromises = []
  // Оставшиеся источники
  const queue = [...normalizedSources]

  // Функция для запуска следующей загрузки
  const startNext = () => {
    if (queue.length === 0) return

    const source = queue.shift()
    const promise = preloadImage(source.src, {
      fallbackSrc: source.fallbackSrc,
      onProgress: options.onProgress,
    })
      .then((result) => {
        loaded++
        if (onProgress) {
          onProgress(loaded / total)
        }
        return result
      })
      .catch((error) => {
        loaded++
        if (onProgress) {
          onProgress(loaded / total)
        }
        console.warn("Failed to preload image:", error)
        return null
      })
      .finally(() => {
        // Удаляем промис из активных и запускаем следующий
        const index = activePromises.indexOf(promise)
        if (index !== -1) {
          activePromises.splice(index, 1)
        }
        startNext()
      })

    activePromises.push(promise)
    allPromises.push(promise)
  }

  // Запускаем начальные загрузки
  for (let i = 0; i < Math.min(concurrency, normalizedSources.length); i++) {
    startNext()
  }

  return Promise.all(allPromises)
}

/**
 * Проверяет, все ли изображения загружены
 * @param {Array} sources - Массив источников изображений
 * @returns {boolean} - true, если все изображения загружены
 */
export function areAllImagesLoaded(sources) {
  if (!sources || sources.length === 0) {
    return true
  }

  // Проверяем каждый источник
  for (const source of sources) {
    const src = typeof source === "string" ? source : source.src
    if (src && !isImageCached(src)) {
      // Если нашли хотя бы одно незагруженное изображение, возвращаем false
      return false
    }
  }

  return true
}

/**
 * Очищает кэш изображений
 */
export function clearImageCache() {
  imageCache.clear()
}

/**
 * Получает размер изображения в байтах
 * @param {string} src - URL изображения
 * @returns {Promise<number>} - Promise с размером изображения
 */
export async function getImageSize(src) {
  try {
    const fixedSrc = fixImageUrl(src)
    const response = await fetch(fixedSrc, { method: "HEAD" })
    const contentLength = response.headers.get("content-length")
    return contentLength ? Number.parseInt(contentLength, 10) : 0
  } catch (error) {
    console.warn(`Failed to get image size for ${src}:`, error)
    return 0
  }
}


import { fixImageUrl } from "./image-helpers"

// Кэш для хранения предзагруженных изображений
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
 * @returns {Promise<HTMLImageElement>} - Promise с элементом изображения
 */
export function preloadImage(src, options = {}) {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("No source provided"))
      return
    }

    const fixedSrc = fixImageUrl(src)

    // Если изображение уже в кэше, сразу разрешаем Promise
    if (imageCache.has(fixedSrc)) {
      resolve(imageCache.get(fixedSrc))
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous" // Для предотвращения CORS-ошибок при использовании с canvas

    img.onload = () => {
      imageCache.set(fixedSrc, img)
      resolve(img)
    }

    img.onerror = () => {
      console.warn(`Failed to load image: ${fixedSrc}`)

      // Если есть запасной URL, пробуем его
      if (options.fallbackSrc) {
        preloadImage(options.fallbackSrc).then(resolve).catch(reject)
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
 * @returns {Promise<Array>} - Promise с массивом результатов
 */
export function preloadImages(sources, onProgress) {
  if (!sources || sources.length === 0) {
    return Promise.resolve([])
  }

  let loaded = 0
  const total = sources.length

  // Нормализуем источники
  const normalizedSources = sources.map((source) => (typeof source === "string" ? { src: source } : source))

  return Promise.allSettled(
    normalizedSources.map(({ src, fallbackSrc }) =>
      preloadImage(src, { fallbackSrc })
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
        }),
    ),
  )
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


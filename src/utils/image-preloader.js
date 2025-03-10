// Исправляем путь импорта - файл называется image-helpers.js
import { fixImageUrl } from "./image-helpers"

// Кэш для хранения предзагруженных изображений
const imageCache = new Set()

/**
 * Предзагружает изображение и добавляет его в кэш
 * @param {string} src - URL изображения
 * @returns {Promise} - Promise, который разрешается, когда изображение загружено
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("No source provided"))
      return
    }

    const fixedSrc = fixImageUrl(src)

    // Если изображение уже в кэше, сразу разрешаем Promise
    if (imageCache.has(fixedSrc)) {
      resolve(fixedSrc)
      return
    }

    const img = new Image()
    img.src = fixedSrc

    img.onload = () => {
      imageCache.add(fixedSrc)
      resolve(fixedSrc)
    }

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${fixedSrc}`))
    }
  })
}

/**
 * Предзагружает массив изображений
 * @param {Array<string>} sources - Массив URL изображений
 * @param {Function} onProgress - Колбэк для отслеживания прогресса (получает число от 0 до 1)
 * @returns {Promise} - Promise, который разрешается, когда все изображения загружены
 */
export function preloadImages(sources, onProgress) {
  if (!sources || sources.length === 0) {
    return Promise.resolve([])
  }

  console.log(`Starting preload of ${sources.length} images`)

  let loaded = 0
  const total = sources.length

  // Функция для обновления прогресса
  const updateProgress = () => {
    loaded++
    if (onProgress) {
      onProgress(loaded / total)
    }
    console.log(`Preloaded ${loaded}/${total} images`)
  }

  return Promise.allSettled(
    sources.map((src) =>
      preloadImage(src)
        .then((result) => {
          updateProgress()
          return result
        })
        .catch((error) => {
          updateProgress()
          console.warn("Failed to preload image:", error)
          return null
        }),
    ),
  )
}

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
 * Очищает кэш изображений
 */
export function clearImageCache() {
  imageCache.clear()
}


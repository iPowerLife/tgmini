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

// Update the preloadImages function to be more aggressive with shop images
export function preloadImages(sources, onProgress, options = {}) {
  if (!sources || sources.length === 0) {
    return Promise.resolve([])
  }

  const concurrency = options.priority ? 15 : options.concurrency || 5 // Increase concurrency for priority loads
  let loaded = 0
  const total = sources.length

  console.log(`Starting to preload ${total} images with concurrency ${concurrency}`)

  // Normalize sources
  const normalizedSources = sources.map((source) => (typeof source === "string" ? { src: source } : source))

  // For tracking all promises
  const allPromises = []
  // Current active promises
  const activePromises = []
  // Remaining sources
  const queue = [...normalizedSources]

  // Function to start next load
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
        // Remove promise from active and start next
        const index = activePromises.indexOf(promise)
        if (index !== -1) {
          activePromises.splice(index, 1)
        }
        startNext()
      })

    activePromises.push(promise)
    allPromises.push(promise)
  }

  // Start initial loads
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

// Add a new function to force cache all shop images
export function forceCacheShopImages(models) {
  if (!models || models.length === 0) return Promise.resolve([])

  console.log("Force caching all shop images...")

  // Get all image URLs from models with fallback URLs
  const imageUrls = models
    .filter((model) => model.image_url && model.image_url.trim() !== "")
    .map((model) => ({
      src: model.image_url,
      fallbackSrc: `/images/miners/default-${model.category_id || "basic"}.png`,
    }))

  // Also add default images for each category
  const defaultImages = [
    { src: "/images/miners/default-basic.png" },
    { src: "/images/miners/default-advanced.png" },
    { src: "/images/miners/default-premium.png" },
    { src: "/images/miners/default.png" },
  ]

  // Combine all images
  const allImages = [...imageUrls, ...defaultImages]

  // Preload with high concurrency and priority
  return preloadImages(allImages, null, {
    concurrency: 20,
    priority: true,
  })
}


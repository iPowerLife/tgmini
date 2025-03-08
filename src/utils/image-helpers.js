/**
 * Проверяет и исправляет URL изображения
 * @param {string} url - URL изображения
 * @returns {string} - Исправленный URL
 */
export function fixImageUrl(url) {
  if (!url) return null

  // Если URL уже полный, возвращаем его как есть
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  // Если URL начинается с /, считаем его относительным путем
  if (url.startsWith("/")) {
    return `https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public${url}`
  }

  // Иначе считаем его именем файла
  return `https://tphsnmoitxericjvgwwn.supabase.co/storage/v1/object/public/miners/images/${url}`
}

/**
 * Проверяет, доступно ли изображение по указанному URL
 * @param {string} url - URL изображения
 * @returns {Promise<boolean>} - Promise, который разрешается в true, если изображение доступно
 */
export function checkImageAvailability(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false)
      return
    }

    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}


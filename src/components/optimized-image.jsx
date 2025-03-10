"use client"

import { useState, useEffect, useRef } from "react"
import { isImageCached, preloadImage } from "../utils/image-utils"
import { fixImageUrl } from "../utils/image-helpers"

export function OptimizedImage({
  src,
  alt,
  className = "",
  fallbackSrc = "/placeholder.svg",
  width,
  height,
  priority = false,
  onLoad,
  style = {},
  objectFit = "cover",
  loading = "lazy",
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState("")
  const imgRef = useRef(null)

  useEffect(() => {
    // Сбрасываем состояние при изменении src
    setLoaded(false)
    setError(false)

    // Если src пустой, используем fallbackSrc
    if (!src) {
      setImageSrc(fallbackSrc)
      return
    }

    // Фиксируем URL изображения
    const fixedSrc = fixImageUrl(src)

    // Устанавливаем исходный src
    setImageSrc(fixedSrc)

    // Если изображение уже в кэше, отмечаем его как загруженное
    if (isImageCached(fixedSrc)) {
      console.log(`Image already cached (OptimizedImage): ${fixedSrc}`)
      setLoaded(true)
      if (onLoad) onLoad()
      return
    }

    // Если установлен приоритет, предзагружаем изображение
    if (priority) {
      preloadImage(fixedSrc, { fallbackSrc })
        .then(() => {
          if (imgRef.current) {
            setLoaded(true)
            if (onLoad) onLoad()
          }
        })
        .catch(() => {
          if (imgRef.current) {
            setError(true)
            setImageSrc(fallbackSrc)
          }
        })
    }
  }, [src, fallbackSrc, priority, onLoad])

  const handleLoad = () => {
    setLoaded(true)
    if (onLoad) onLoad()
  }

  const handleError = () => {
    setError(true)
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width || "100%",
        height: height || "auto",
        ...style,
      }}
    >
      {/* Плейсхолдер */}
      {!loaded && <div className="absolute inset-0 bg-gray-800 animate-pulse" style={{ borderRadius: "inherit" }} />}

      {/* Изображение */}
      <img
        ref={imgRef}
        src={imageSrc || "/placeholder.svg"}
        alt={alt || "Image"}
        className={`w-full h-full transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ objectFit, borderRadius: "inherit" }}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        width={width}
        height={height}
      />
    </div>
  )
}


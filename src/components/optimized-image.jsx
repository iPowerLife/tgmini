"use client"

import { useState, useEffect } from "react"
import { fixImageUrl } from "../utils/image-helpers"

export function OptimizedImage({
  src,
  alt,
  className = "",
  fallbackSrc,
  width,
  height,
  priority = false,
  onLoad,
  style = {},
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState("")

  useEffect(() => {
    // Сбрасываем состояние при изменении src
    setLoaded(false)
    setError(false)

    // Исправляем URL изображения
    const fixedSrc = fixImageUrl(src)
    setImageSrc(fixedSrc || fallbackSrc)

    // Если установлен приоритет, предзагружаем изображение
    if (priority && fixedSrc) {
      const img = new Image()
      img.src = fixedSrc
      img.onload = () => {
        setLoaded(true)
        if (onLoad) onLoad()
      }
      img.onerror = () => {
        setError(true)
        setImageSrc(fallbackSrc)
      }
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
        src={imageSrc || "/placeholder.svg"}
        alt={alt || "Image"}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{ borderRadius: "inherit" }}
      />
    </div>
  )
}


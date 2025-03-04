"use client"

import { useState, useEffect, memo } from "react"

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  placeholderColor = "#1a1b1e",
  ...props
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Сбрасываем состояние при изменении src
    setLoaded(false)
    setError(false)

    // Предзагружаем изображение
    const img = new Image()
    img.src = src

    img.onload = () => setLoaded(true)
    img.onerror = () => setError(true)

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  // Если ошибка загрузки, показываем плейсхолдер
  if (error) {
    return (
      <div
        className={className}
        style={{
          width: width || "100%",
          height: height || "100%",
          backgroundColor: placeholderColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: "0.75rem",
        }}
        {...props}
      >
        {alt?.charAt(0) || "?"}
      </div>
    )
  }

  return (
    <div style={{ position: "relative", width: width || "100%", height: height || "100%" }}>
      {!loaded && (
        <div
          className={className}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: placeholderColor,
          }}
        />
      )}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ transition: "opacity 0.3s ease" }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        {...props}
      />
    </div>
  )
})


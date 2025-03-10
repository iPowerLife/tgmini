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
    // Reset state when src changes
    setLoaded(false)
    setError(false)

    // If src is empty, use fallbackSrc
    if (!src) {
      setImageSrc(fallbackSrc)
      return
    }

    // Fix image URL
    const fixedSrc = fixImageUrl(src)

    // Set initial src
    setImageSrc(fixedSrc)

    // If image is already in cache, mark it as loaded
    if (isImageCached(fixedSrc)) {
      console.log(`Image already cached (OptimizedImage): ${fixedSrc}`)
      setLoaded(true)
      if (onLoad) onLoad()
      return
    }

    // Always preload the image, not just when priority is true
    // This ensures consistent behavior for all images
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
  }, [src, fallbackSrc, onLoad])

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


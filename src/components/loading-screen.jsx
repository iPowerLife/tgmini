"use client"

import { useState, useEffect } from "react"

export function LoadingScreen({ onLoadComplete }) {
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const minerImages = [
      "/miners/miner1.png",
      "/miners/miner2.png",
      "/miners/miner3.png",
      "/miners/miner4.png",
      "/miners/miner5.png",
      "/miners/miner6.png",
      "/miners/miner7.png",
      "/miners/miner8.png",
      "/miners/miner9.png",
      "/miners/miner10.png",
      "/miners/miner11.png",
      "/miners/miner12.png",
    ]

    const preloadImages = async () => {
      const totalImages = minerImages.length
      let loadedImages = 0

      const loadImage = (src) =>
        new Promise((resolve, reject) => {
          const img = new Image()
          img.src = src
          img.onload = () => resolve()
          img.onerror = () => resolve() // Продолжаем загрузку даже если картинка не загрузилась
        })

      for (const src of minerImages) {
        await loadImage(src)
        loadedImages++
        setProgress((loadedImages / totalImages) * 100)
      }

      setIsLoading(false)
      if (onLoadComplete) {
        onLoadComplete()
      }
    }

    preloadImages()
  }, [onLoadComplete])

  return (
    <div className="fixed inset-0 bg-[#1a1b23] flex items-center justify-center z-50">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-white mb-2">Загрузка игры...</h2>
          <p className="text-gray-400 text-sm">Подождите, идет загрузка ресурсов</p>
        </div>

        <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
          <div className="bg-blue-500 h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>

        <div className="text-center mt-2">
          <span className="text-gray-400 text-sm">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  )
}


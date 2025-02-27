"use client"

import { useEffect } from "react"
import Script from "next/script"
import "../styles/globals.css"

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Инициализация Telegram WebApp
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand() // Раскрываем на весь экран
    }
  }, [])

  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp


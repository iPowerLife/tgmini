"use client"

import { useState, useEffect } from "react"
import { getTelegramUser } from "../utils/telegram"

export function useTelegramUser() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const telegramUser = getTelegramUser()
      if (telegramUser) {
        setUser({
          id: telegramUser.id,
          username: telegramUser.username,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          languageCode: telegramUser.language_code,
          photoUrl: telegramUser.photo_url,
        })
      }
    } catch (error) {
      console.error("Error in useTelegramUser hook:", error)
    }
  }, [])

  return user
}


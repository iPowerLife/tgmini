import { supabase } from "./supabaseClient"
import { sendTelegramMessage } from "./telegram"

// Обработка реферальной ссылки
const handleReferral = async (telegramUser) => {
  try {
    // Получаем параметр startapp
    const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param

    if (startParam) {
      console.log("DEBUG: Referral parameter detected:", startParam)

      // Проверяем, что пользователь не регистрирует сам себя
      if (startParam === telegramUser.id.toString()) {
        console.log("User tried to refer themselves")
        return
      }

      // Получаем ID пользователя-реферера из базы данных
      const { data: referrerData, error: referrerError } = await supabase
        .from("users")
        .select("id")
        .eq("telegram_id", startParam)
        .single()

      if (referrerError || !referrerData) {
        console.error("Referrer not found:", referrerError)
        return
      }

      // Получаем ID текущего пользователя из базы данных
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("telegram_id", telegramUser.id)
        .single()

      if (userError || !userData) {
        console.error("User not found:", userError)
        return
      }

      // Проверяем, не зарегистрирован ли уже этот реферал
      const { data: existingReferral, error: existingError } = await supabase
        .from("referral_users")
        .select("id")
        .eq("referrer_id", referrerData.id)
        .eq("referred_id", userData.id)
        .single()

      if (!existingError && existingReferral) {
        console.log("Referral already exists")
        return
      }

      // Регистрируем нового реферала
      const { error: insertError } = await supabase.from("referral_users").insert({
        referrer_id: referrerData.id,
        referred_id: userData.id,
        status: "active",
      })

      if (insertError) {
        console.error("Error registering referral:", insertError)
      } else {
        console.log("Referral successfully registered")

        // Константы с размерами наград
        const REFERRER_REWARD = 50 // Награда пригласившему
        const REFERRED_REWARD = 25 // Награда приглашенному

        // Начисляем награду рефоводу (пригласившему)
        const { error: referrerUpdateError } = await supabase.rpc("increment_user_balance", {
          user_id_param: referrerData.id,
          amount_param: REFERRER_REWARD,
        })

        if (referrerUpdateError) {
          console.error("Error rewarding referrer:", referrerUpdateError)
        } else {
          console.log(`Referrer rewarded with ${REFERRER_REWARD} diamonds`)

          // Записываем награду в историю транзакций
          await supabase.from("transactions").insert({
            user_id: referrerData.id,
            amount: REFERRER_REWARD,
            type: "referral_reward",
            description: `Reward for inviting user ${userData.id}`,
            created_at: new Date().toISOString(),
          })

          // Получаем telegram_id реферера для отправки уведомления
          const { data: referrerTelegramData, error: referrerTelegramError } = await supabase
            .from("users")
            .select("telegram_id")
            .eq("id", referrerData.id)
            .single()

          if (!referrerTelegramError && referrerTelegramData?.telegram_id) {
            // Формируем текст уведомления
            const notificationText = `
<b>🎉 У вас новый реферал!</b>

Пользователь <b>${telegramUser.first_name || "Новый пользователь"}</b> присоединился по вашей реферальной ссылке.

<b>💎 Вы получили награду: ${REFERRER_REWARD} алмазов</b>

Продолжайте приглашать друзей и получать бонусы!
`

            // Отправляем уведомление рефоводу
            sendTelegramMessage(referrerTelegramData.telegram_id, notificationText).then((result) => {
              if (result) {
                console.log(`Notification sent to referrer (${referrerTelegramData.telegram_id})`)
              }
            })
          }
        }

        // Начисляем награду приглашенному пользователю
        const { error: referredUpdateError } = await supabase.rpc("increment_user_balance", {
          user_id_param: userData.id,
          amount_param: REFERRED_REWARD,
        })

        if (referredUpdateError) {
          console.error("Error rewarding referred user:", referredUpdateError)
        } else {
          console.log(`Referred user rewarded with ${REFERRED_REWARD} diamonds`)

          // Записываем награду в историю транзакций
          await supabase.from("transactions").insert({
            user_id: userData.id,
            amount: REFERRED_REWARD,
            type: "referral_bonus",
            description: `Bonus for joining via referral link`,
            created_at: new Date().toISOString(),
          })
        }
      }
    }
  } catch (error) {
    console.error("Error processing referral:", error)
  }
}


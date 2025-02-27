import { supabase } from "../supabase"

export async function getAchievements(userId) {
  try {
    console.log("Fetching achievements for user:", userId)

    // Получаем все достижения
    const { data: achievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("*")
      .order("requirement_value", { ascending: true })

    if (achievementsError) {
      console.error("Error fetching achievements:", achievementsError)
      throw achievementsError
    }

    console.log("Fetched achievements:", achievements)

    // Получаем достижения пользователя
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", userId)

    if (userAchievementsError) {
      console.error("Error fetching user achievements:", userAchievementsError)
      throw userAchievementsError
    }

    console.log("Fetched user achievements:", userAchievements)

    // Объединяем данные
    const combinedAchievements = achievements.map((achievement) => ({
      ...achievement,
      obtained: userAchievements.some((ua) => ua.achievement_id === achievement.id),
      obtained_at: userAchievements.find((ua) => ua.achievement_id === achievement.id)?.obtained_at,
    }))

    console.log("Combined achievements:", combinedAchievements)
    return combinedAchievements
  } catch (error) {
    console.error("Error in getAchievements:", error)
    return []
  }
}

export async function checkAchievements(userId, userStats) {
  try {
    console.log("Checking achievements for user:", userId, "stats:", userStats)

    // Получаем все недополученные достижения
    const achievements = await getAchievements(userId)
    const unobainedAchievements = achievements.filter((a) => !a.obtained)

    console.log("Unobtained achievements:", unobainedAchievements)

    for (const achievement of unobainedAchievements) {
      let isCompleted = false

      // Проверяем выполнение условий
      switch (achievement.requirement_type) {
        case "balance":
          isCompleted = userStats.balance >= achievement.requirement_value
          break
        case "level":
          isCompleted = userStats.level >= achievement.requirement_value
          break
      }

      console.log("Achievement check:", {
        achievement: achievement.name,
        isCompleted,
        requirement: achievement.requirement_type,
        current: userStats[achievement.requirement_type],
        required: achievement.requirement_value,
      })

      // Если достижение выполнено, записываем его и выдаем награду
      if (isCompleted) {
        console.log("Achievement completed:", achievement.name)

        // Записываем достижение
        const { error: achievementError } = await supabase.from("user_achievements").insert([
          {
            user_id: userId,
            achievement_id: achievement.id,
          },
        ])

        if (achievementError) {
          console.error("Error recording achievement:", achievementError)
          throw achievementError
        }

        // Выдаем награду
        const update = {}
        if (achievement.reward_type === "mining_power") {
          update.mining_power = userStats.mining_power + achievement.reward_value
        } else if (achievement.reward_type === "balance") {
          update.balance = userStats.balance + achievement.reward_value
        }

        const { error: updateError } = await supabase.from("users").update(update).eq("id", userId)

        if (updateError) {
          console.error("Error updating user stats:", updateError)
          throw updateError
        }

        // Логируем транзакцию награды
        const { error: transactionError } = await supabase.from("transactions").insert([
          {
            user_id: userId,
            amount: achievement.reward_value,
            type: `achievement_${achievement.reward_type}`,
            description: `Награда за достижение "${achievement.name}"`,
          },
        ])

        if (transactionError) {
          console.error("Error logging transaction:", transactionError)
          throw transactionError
        }

        console.log("Achievement reward granted:", {
          achievement: achievement.name,
          reward: achievement.reward_value,
          type: achievement.reward_type,
        })
      }
    }

    return true
  } catch (error) {
    console.error("Error in checkAchievements:", error)
    return false
  }
}


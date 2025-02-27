import { supabase } from "../supabase"

export async function getAchievements(userId) {
  try {
    // Получаем все достижения
    const { data: achievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("*")
      .order("requirement_value", { ascending: true })

    if (achievementsError) throw achievementsError

    // Получаем достижения пользователя
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", userId)

    if (userAchievementsError) throw userAchievementsError

    // Объединяем данные
    return achievements.map((achievement) => ({
      ...achievement,
      obtained: userAchievements.some((ua) => ua.achievement_id === achievement.id),
      obtained_at: userAchievements.find((ua) => ua.achievement_id === achievement.id)?.obtained_at,
    }))
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return []
  }
}

export async function checkAchievements(userId, userStats) {
  try {
    // Получаем все недополученные достижения
    const achievements = await getAchievements(userId)
    const unobainedAchievements = achievements.filter((a) => !a.obtained)

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
        // Добавим другие типы достижений позже
      }

      // Если достижение выполнено, записываем его и выдаем награду
      if (isCompleted) {
        // Записываем достижение
        const { error: achievementError } = await supabase.from("user_achievements").insert([
          {
            user_id: userId,
            achievement_id: achievement.id,
          },
        ])

        if (achievementError) throw achievementError

        // Выдаем награду
        const update = {}
        if (achievement.reward_type === "mining_power") {
          update.mining_power = userStats.mining_power + achievement.reward_value
        } else if (achievement.reward_type === "balance") {
          update.balance = userStats.balance + achievement.reward_value
        }

        const { error: updateError } = await supabase.from("users").update(update).eq("id", userId)

        if (updateError) throw updateError

        // Логируем транзакцию награды
        const { error: transactionError } = await supabase.from("transactions").insert([
          {
            user_id: userId,
            amount: achievement.reward_value,
            type: `achievement_${achievement.reward_type}`,
            description: `Награда за достижение "${achievement.name}"`,
          },
        ])

        if (transactionError) throw transactionError
      }
    }

    return true
  } catch (error) {
    console.error("Error checking achievements:", error)
    return false
  }
}


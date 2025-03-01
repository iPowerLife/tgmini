// В функции handleClaimReward обновляем обработку ошибки:
const handleClaimReward = async (task) => {
  try {
    // Завершаем задание
    const { data: completeData, error: completeError } = await supabase.rpc("complete_task", {
      user_id_param: user.id,
      task_id_param: task.id,
    })

    if (completeError) throw completeError

    // Проверяем результат выполнения
    if (completeData && !completeData.success) {
      if (completeData.remaining_seconds > 0) {
        // Обновляем состояние таймера
        setTaskStates((prev) => ({
          ...prev,
          [task.id]: {
            status: "verifying",
            timeLeft: completeData.remaining_seconds * 1000,
          },
        }))
        return // Прерываем выполнение, не пытаемся получить награду
      }
      throw new Error(completeData.message)
    }

    // Получаем награду только если задание успешно завершено
    const { error: rewardError } = await supabase.rpc("claim_task_reward", {
      user_id_param: user.id,
      task_id_param: task.id,
    })

    if (rewardError) throw rewardError

    // Обновляем список заданий
    await loadTasks()
  } catch (error) {
    console.error("Ошибка при получении награды:", error)
    alert(error.message || "Ошибка при получении награды")
  }
}

// В функции handleExecuteTask обновляем время верификации:
const handleExecuteTask = async (task) => {
  try {
    const { error: startError } = await supabase.rpc("start_task", {
      user_id_param: user.id,
      task_id_param: task.id,
    })

    if (startError) throw startError

    // Используем verification_time из задания
    const verificationTime = (task.verification_time || 15) * 1000 // конвертируем в миллисекунды

    setTaskStates((prev) => ({
      ...prev,
      [task.id]: { status: "verifying", timeLeft: verificationTime },
    }))

    if (task.link) {
      window.open(task.link, "_blank")
    }

    const interval = setInterval(() => {
      setTaskStates((prev) => {
        const taskState = prev[task.id]
        if (!taskState || taskState.timeLeft <= 0) {
          clearInterval(interval)
          return prev
        }

        const newTimeLeft = taskState.timeLeft - 1000
        return {
          ...prev,
          [task.id]: {
            status: newTimeLeft > 0 ? "verifying" : "completed",
            timeLeft: newTimeLeft,
          },
        }
      })
    }, 1000)
  } catch (error) {
    console.error("Ошибка при выполнении задания:", error)
    alert(error.message || "Ошибка при выполнении задания")
  }
}


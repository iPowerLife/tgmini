// Добавим улучшенную функцию форматирования чисел
export function formatNumber(num) {
  if (!num && num !== 0) return "0"

  try {
    // Для больших чисел используем компактный формат
    if (num >= 1000000) {
      return new Intl.NumberFormat("ru-RU", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(num)
    }

    // Для обычных чисел используем группировку по разрядам
    return new Intl.NumberFormat("ru-RU").format(num)
  } catch (error) {
    console.error("Error formatting number:", error)
    return num.toString()
  }
}


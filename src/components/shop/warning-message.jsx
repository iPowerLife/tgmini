"use client"
import { AlertTriangle } from "lucide-react"

export function WarningMessage() {
  return (
    <div className="mt-3 bg-yellow-950/50 border border-yellow-500/20 rounded-lg p-3 flex gap-2">
      <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
      <div>
        <div className="text-yellow-500 text-sm font-medium mb-0.5">Важное уведомление</div>
        <div className="text-yellow-500/80 text-xs">
          Все покупки являются окончательными. Пожалуйста, внимательно проверяйте выбранные товары перед покупкой.
        </div>
      </div>
    </div>
  )
}


"use client"

import { useState } from "react"
import { Check } from "lucide-react"

export function TasksSection({ user, tasks, onBalanceUpdate, onTaskComplete }) {
  const [activeTab, setActiveTab] = useState("daily")

  return (
    <div className="min-h-[100vh] pb-[70px] bg-[#1A1F2E]">
      {/* Заголовок */}
      <div className="px-4 pt-4 pb-6">
        <h1 className="text-2xl font-bold text-center mb-1 text-white">All Tasks</h1>
        <p className="text-gray-400 text-center text-sm">Small tasks, big rewards! Earn AP and level up your game.</p>
      </div>

      {/* Табы */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {["daily", "partners", "social"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                ${
                  activeTab === tab
                    ? "bg-[#2A3142] text-white"
                    : "text-gray-400 hover:text-gray-300 hover:bg-[#2A3142]/50"
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Список заданий */}
      <div className="px-4 space-y-2 pb-24">
        {tasks
          .filter((task) => task.category === activeTab)
          .map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 bg-[#242838] rounded-xl border border-[#2A3142]"
            >
              {/* Иконка и информация */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#2A3142] flex items-center justify-center">
                  <img
                    src={task.icon_url || "/icons/task-icon.png"}
                    alt=""
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.src = "/icons/task-icon.png"
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{task.title}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-sm text-blue-400">+{task.reward}</span>
                    <span className="text-sm text-gray-400">AP</span>
                  </div>
                </div>
              </div>

              {/* Кнопка действия */}
              {task.is_completed ? (
                <div className="w-8 h-8 rounded-lg bg-[#2A3142] flex items-center justify-center">
                  <Check className="w-4 h-4 text-gray-400" />
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (task.link) {
                      const tg = window.Telegram?.WebApp
                      if (tg) {
                        tg.openLink(task.link)
                      } else {
                        window.open(task.link, "_blank")
                      }
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#2A3142] text-sm font-medium text-white hover:bg-[#323847] transition-colors"
                >
                  Go
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}


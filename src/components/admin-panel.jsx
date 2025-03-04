"use client"

import { useState, useEffect } from "react"
import { createNotification, sendNotification, getNotifications, getNotificationDetails } from "../utils/notifications"

export function AdminPanel() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [notifications, setNotifications] = useState([])
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Загружаем список уведомлений
  useEffect(() => {
    async function loadNotifications() {
      const { success, notifications, error } = await getNotifications()
      if (success) {
        setNotifications(notifications)
      } else {
        setError(error)
      }
    }

    loadNotifications()
  }, [])

  // Функция для создания нового уведомления
  async function handleCreateNotification() {
    if (!title || !message) {
      setError("Пожалуйста, заполните все поля")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { success, notification, error } = await createNotification(title, message)

      if (success) {
        setSuccess("Уведомление успешно создано")
        setTitle("")
        setMessage("")
        setNotifications([notification, ...notifications])
      } else {
        setError(error)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Функция для отправки уведомления
  async function handleSendNotification(notificationId) {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { success, stats, error } = await sendNotification(notificationId)

      if (success) {
        setSuccess(`Уведомление отправлено: ${stats.sent} из ${stats.total} (${stats.failed} ошибок)`)

        // Обновляем список уведомлений
        const { success: loadSuccess, notifications: updatedNotifications } = await getNotifications()
        if (loadSuccess) {
          setNotifications(updatedNotifications)
        }
      } else {
        setError(error)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Функция для просмотра деталей уведомления
  async function handleViewDetails(notificationId) {
    setLoading(true)
    setError(null)

    try {
      const { success, notification, statuses, stats, error } = await getNotificationDetails(notificationId)

      if (success) {
        setSelectedNotification({ notification, statuses, stats })
      } else {
        setError(error)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Панель администратора</h1>

        {/* Форма создания уведомления */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Создать уведомление</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg mb-4">{error}</div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-2 rounded-lg mb-4">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Заголовок</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white"
                placeholder="Введите заголовок уведомления"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Сообщение</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white min-h-[100px]"
                placeholder="Введите текст уведомления"
              />
            </div>

            <button
              onClick={handleCreateNotification}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {loading ? "Создание..." : "Создать уведомление"}
            </button>
          </div>
        </div>

        {/* Список уведомлений */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Список уведомлений</h2>

          {notifications.length === 0 ? (
            <div className="text-gray-400 text-center py-4">Нет уведомлений</div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-medium">{notification.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        notification.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-200"
                          : notification.status === "sending"
                            ? "bg-blue-500/20 text-blue-200"
                            : "bg-green-500/20 text-green-200"
                      }`}
                    >
                      {notification.status === "pending"
                        ? "Ожидает"
                        : notification.status === "sending"
                          ? "Отправляется"
                          : "Отправлено"}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{notification.message}</p>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Создано: {new Date(notification.created_at).toLocaleString()}</span>
                    <span>
                      Отправлено: {notification.sent_count} из {notification.total_count}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleViewDetails(notification.id)}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                    >
                      Детали
                    </button>

                    {notification.status === "pending" && (
                      <button
                        onClick={() => handleSendNotification(notification.id)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                      >
                        Отправить
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Модальное окно с деталями уведомления */}
        {selectedNotification && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">{selectedNotification.notification.title}</h2>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Сообщение:</h3>
                <p className="text-white bg-gray-900/50 p-3 rounded">{selectedNotification.notification.message}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-green-500/20 border border-green-500/50 rounded p-2 text-center">
                  <span className="block text-xs text-gray-400">Отправлено</span>
                  <span className="text-green-200 font-bold">{selectedNotification.stats.sent}</span>
                </div>
                <div className="bg-red-500/20 border border-red-500/50 rounded p-2 text-center">
                  <span className="block text-xs text-gray-400">Ошибки</span>
                  <span className="text-red-200 font-bold">{selectedNotification.stats.failed}</span>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-2 text-center">
                  <span className="block text-xs text-gray-400">Ожидает</span>
                  <span className="text-yellow-200 font-bold">{selectedNotification.stats.pending}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Статистика отправки:</h3>
                <div className="bg-gray-900/50 rounded p-3 max-h-[200px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-700/50">
                        <th className="text-left py-2">Пользователь</th>
                        <th className="text-left py-2">Статус</th>
                        <th className="text-left py-2">Время</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedNotification.statuses.map((status, index) => (
                        <tr key={index} className="border-b border-gray-800/50 last:border-0">
                          <td className="py-2">{status.bot_users?.first_name || "Неизвестно"}</td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                status.status === "sent"
                                  ? "bg-green-500/20 text-green-200"
                                  : status.status === "failed"
                                    ? "bg-red-500/20 text-red-200"
                                    : "bg-yellow-500/20 text-yellow-200"
                              }`}
                            >
                              {status.status === "sent"
                                ? "Отправлено"
                                : status.status === "failed"
                                  ? "Ошибка"
                                  : "Ожидает"}
                            </span>
                          </td>
                          <td className="py-2 text-gray-400">
                            {status.sent_at ? new Date(status.sent_at).toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


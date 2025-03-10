"use client"

import { useState, useEffect, useRef } from "react"
import { Trophy, Users, Award, Crown, Search, ChevronUp, ChevronDown, User } from "lucide-react"
import { supabase } from "../supabase"

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: "14px",
    color: "#777",
  },
  tabs: {
    display: "flex",
    marginBottom: "20px",
  },
  tab: {
    flex: 1,
    padding: "10px",
    textAlign: "center",
    cursor: "pointer",
    borderBottom: "2px solid #ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
  },
  activeTab: {
    borderBottomColor: "#4CAF50",
    color: "#4CAF50",
    fontWeight: "bold",
  },
  inactiveTab: {
    color: "#777",
  },
  searchContainer: {
    position: "relative",
    marginBottom: "20px",
  },
  searchIcon: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#777",
  },
  searchInput: {
    width: "100%",
    padding: "10px 30px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "14px",
  },
  userList: {
    overflowY: "auto",
    maxHeight: "400px",
  },
  userItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    borderBottom: "1px solid #eee",
    transition: "background-color 0.2s",
    position: "relative",
  },
  currentUserItem: {
    backgroundColor: "#f0f0f0",
  },
  position: {
    width: "30px",
    textAlign: "center",
    marginRight: "10px",
    fontSize: "14px",
    color: "#555",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    overflow: "hidden",
    marginRight: "10px",
    backgroundColor: "#ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
  },
  userLevel: {
    fontSize: "12px",
    color: "#777",
  },
  metric: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    color: "#555",
  },
  expandButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0",
    marginLeft: "10px",
    color: "#777",
  },
  userDetails: {
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderBottom: "1px solid #eee",
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#555",
    padding: "5px 0",
  },
  detailLabel: {
    fontWeight: "bold",
  },
  detailValue: {
    textAlign: "right",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100px",
  },
  loadingSpinner: {
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #3498db",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 2s linear infinite",
    "@keyframes spin": {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
  },
  emptyState: {
    textAlign: "center",
    padding: "20px",
    color: "#777",
  },
  emptyStateText: {
    fontSize: "16px",
  },
}

const getPositionStyle = (index) => {
  if (index === 0) {
    return { color: "#FFD700", fontWeight: "bold" }
  } else if (index === 1) {
    return { color: "#C0C0C0", fontWeight: "bold" }
  } else if (index === 2) {
    return { color: "#CD7F32", fontWeight: "bold" }
  }
  return {}
}

const getPositionIcon = (index) => {
  if (index === 0) {
    return <Crown size={16} color="#FFD700" />
  } else if (index === 1) {
    return <Award size={16} color="#C0C0C0" />
  } else if (index === 2) {
    return <Trophy size={16} color="#CD7F32" />
  }
  return null
}

const getMetricValue = (user) => {
  return user.balance.toFixed(2)
}

const getMetricIcon = () => {
  return "💎"
}

export function RatingList({ users = [], currentUserId, activeTab = "balance", onTabChange }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredUsers, setFilteredUsers] = useState([])
  const [expandedUser, setExpandedUser] = useState(null)
  const containerRef = useRef(null)
  const currentUserRef = useRef(null)
  const [loading, setLoading] = useState(!users || users.length === 0)
  const [error, setError] = useState(null)

  // Загрузка данных пользователей, если они не были переданы
  useEffect(() => {
    // Если у нас есть данные, используем их
    if (users && users.length > 0) {
      console.log("Using provided users data:", users.length, "users")
      setFilteredUsers(users)
      setLoading(false)
      return
    }

    // Иначе загружаем данные из базы
    const fetchUsers = async () => {
      try {
        setLoading(true)
        console.log("Fetching users data from database...")

        // Делаем запрос к базе данных с правильным типом данных
        const { data, error: supabaseError } = await supabase
          .from("users")
          .select(`
            id,
            telegram_id,
            username,
            first_name,
            last_name,
            photo_url,
            balance,
            level,
            referral_count,
            mining_power
          `)
          .order("balance", { ascending: false })
          .limit(100)

        if (supabaseError) {
          throw supabaseError
        }

        if (!data) {
          throw new Error("Нет данных")
        }

        console.log("Fetched", data.length, "users from database")

        // Преобразуем данные для отображения
        const processedData = data.map((user) => ({
          id: user.telegram_id || user.id,
          display_name: user.username ? `@${user.username}` : user.first_name || `User ${user.id}`,
          photo_url: user.photo_url,
          balance: Number(user.balance || 0),
          referral_count: Number(user.referral_count || 0),
          level: Number(user.level || 1),
          mining_power: Number(user.mining_power || 0),
        }))

        setFilteredUsers(processedData)
        setLoading(false)
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err)
        setError(err.message || "Не удалось загрузить данные рейтинга")
        setLoading(false)
      }
    }

    fetchUsers()
  }, [users])

  // Остальной код компонента остается без изменений...
  // (оставляем весь остальной код как есть)

  return (
    <div style={styles.container}>
      {/* Заголовок */}
      <div style={styles.header}>
        <h1 style={styles.title}>Рейтинг игроков</h1>
        <p style={styles.subtitle}>Соревнуйтесь с другими игроками и поднимайтесь в рейтинге</p>
      </div>

      {/* Вкладки */}
      <div style={styles.tabs}>
        <div
          style={{
            ...styles.tab,
            ...(activeTab === "balance" ? styles.activeTab : styles.inactiveTab),
          }}
          onClick={() => onTabChange("balance")}
        >
          <Trophy size={16} />
          <span>По балансу</span>
        </div>
        <div
          style={{
            ...styles.tab,
            ...(activeTab === "referrals" ? styles.activeTab : styles.inactiveTab),
          }}
          onClick={() => onTabChange("referrals")}
        >
          <Users size={16} />
          <span>По рефералам</span>
        </div>
      </div>

      {/* Поиск */}
      <div style={styles.searchContainer}>
        <Search size={16} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Поиск по имени..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Список пользователей */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
      ) : error ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyStateText}>{error}</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div style={styles.userList} ref={containerRef}>
          {filteredUsers.map((user, index) => {
            const isCurrentUser = currentUserId && String(user.id) === String(currentUserId)
            const isExpanded = expandedUser === user.id

            return (
              <div key={user.id}>
                <div
                  style={{
                    ...styles.userItem,
                    ...(isCurrentUser ? styles.currentUserItem : {}),
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                  ref={isCurrentUser ? currentUserRef : null}
                >
                  {/* Позиция */}
                  <div style={{ ...styles.position, ...getPositionStyle(index) }}>
                    {getPositionIcon(index) || index + 1}
                  </div>

                  {/* Аватар */}
                  <div style={styles.avatar}>
                    {user.photo_url ? (
                      <img
                        src={user.photo_url || "/placeholder.svg"}
                        alt={user.display_name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      user.display_name?.[0] || <User size={16} />
                    )}
                  </div>

                  {/* Информация о пользователе */}
                  <div style={styles.userInfo}>
                    <div style={styles.userName}>{user.display_name}</div>
                    <div style={styles.userLevel}>Уровень {user.level || 1}</div>
                  </div>

                  {/* Метрика */}
                  <div style={styles.metric}>
                    <span>{getMetricValue(user)}</span>
                    <span style={{ marginLeft: "4px" }}>{getMetricIcon()}</span>
                  </div>

                  {/* Кнопка раскрытия */}
                  <button style={styles.expandButton}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Детали пользователя */}
                {isExpanded && (
                  <div style={styles.userDetails}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>ID:</span>
                      <span style={styles.detailValue}>{user.id}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Баланс:</span>
                      <span style={styles.detailValue}>{user.balance.toFixed(2)} 💎</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Рефералы:</span>
                      <span style={styles.detailValue}>{user.referral_count} 👥</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Уровень:</span>
                      <span style={styles.detailValue}>{user.level} ⭐</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Мощность:</span>
                      <span style={styles.detailValue}>{user.mining_power.toFixed(2)} ⚡</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p style={styles.emptyStateText}>{searchQuery ? "Пользователи не найдены" : "Нет данных для отображения"}</p>
        </div>
      )}
    </div>
  )
}


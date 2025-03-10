"use client"

import { useState, useEffect, useRef } from "react"
import { Trophy, Users, Award, Crown, Star, Search, ChevronUp, ChevronDown, User } from "lucide-react"

export function RatingList({ users = [], currentUserId, activeTab = "balance", onTabChange }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredUsers, setFilteredUsers] = useState(users)
  const [expandedUser, setExpandedUser] = useState(null)
  const containerRef = useRef(null)
  const currentUserRef = useRef(null)

  // Фильтрация пользователей при изменении поискового запроса или списка пользователей
  useEffect(() => {
    if (!users || users.length === 0) {
      setFilteredUsers([])
      return
    }

    // Если поисковый запрос пустой, показываем всех пользователей
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
      return
    }

    // Фильтруем пользователей по имени
    const filtered = users.filter((user) => user.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  // Прокрутка к текущему пользователю при загрузке
  useEffect(() => {
    if (currentUserRef.current) {
      currentUserRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [filteredUsers])

  // Находим позицию текущего пользователя в списке
  const findUserPosition = () => {
    if (!currentUserId || filteredUsers.length === 0) return null
    return filteredUsers.findIndex((user) => String(user.id) === String(currentUserId)) + 1
  }

  // Получаем текущего пользователя
  const currentUser = currentUserId ? filteredUsers.find((user) => String(user.id) === String(currentUserId)) : null

  // Получаем пользователя на последнем месте в топ-100
  const lastTopUser = filteredUsers.length > 0 ? filteredUsers[filteredUsers.length - 1] : null

  // Получаем метрику в зависимости от активной вкладки
  const getMetricValue = (user) => {
    if (!user) return "0"
    switch (activeTab) {
      case "balance":
        return (user.balance || 0).toFixed(2)
      case "referrals":
        return user.referral_count || 0
      default:
        return (user.balance || 0).toFixed(2)
    }
  }

  // Получаем иконку для метрики
  const getMetricIcon = () => {
    switch (activeTab) {
      case "balance":
        return "💎"
      case "referrals":
        return "👥"
      default:
        return "💎"
    }
  }

  // Стили для компонента
  const styles = {
    container: {
      maxWidth: "100%",
      margin: "0 auto",
      padding: "16px",
      backgroundColor: "#151B26",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    header: {
      marginBottom: "16px",
      textAlign: "center",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#fff",
      marginBottom: "8px",
    },
    subtitle: {
      fontSize: "0.875rem",
      color: "#94a3b8",
      marginBottom: "16px",
    },
    tabs: {
      display: "flex",
      backgroundColor: "#1E293B",
      borderRadius: "8px",
      padding: "4px",
      marginBottom: "16px",
    },
    tab: {
      flex: 1,
      padding: "8px 12px",
      textAlign: "center",
      borderRadius: "6px",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
    },
    activeTab: {
      backgroundColor: "#3B82F6",
      color: "#fff",
    },
    inactiveTab: {
      color: "#94a3b8",
    },
    searchContainer: {
      position: "relative",
      marginBottom: "16px",
    },
    searchInput: {
      width: "100%",
      padding: "10px 16px 10px 40px",
      backgroundColor: "#1E293B",
      border: "1px solid #2D3748",
      borderRadius: "8px",
      color: "#fff",
      fontSize: "0.875rem",
      outline: "none",
    },
    searchIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#94a3b8",
    },
    userList: {
      maxHeight: "60vh",
      overflowY: "auto",
      borderRadius: "8px",
      backgroundColor: "#1A1F2E",
    },
    userItem: {
      display: "flex",
      alignItems: "center",
      padding: "12px 16px",
      borderBottom: "1px solid #2D3748",
      transition: "background-color 0.2s ease",
    },
    currentUserItem: {
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderLeft: "3px solid #3B82F6",
    },
    position: {
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.75rem",
      fontWeight: "bold",
      marginRight: "12px",
      flexShrink: 0,
    },
    positionTop1: {
      backgroundColor: "#FCD34D",
      color: "#000",
    },
    positionTop2: {
      backgroundColor: "#E5E7EB",
      color: "#000",
    },
    positionTop3: {
      backgroundColor: "#D97706",
      color: "#fff",
    },
    positionOther: {
      backgroundColor: "#2D3748",
      color: "#fff",
    },
    avatar: {
      width: "36px",
      height: "36px",
      borderRadius: "8px",
      marginRight: "12px",
      overflow: "hidden",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#2D3748",
      fontSize: "1rem",
      fontWeight: "bold",
      color: "#fff",
    },
    userInfo: {
      flex: 1,
      minWidth: 0,
    },
    userName: {
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#fff",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    userLevel: {
      fontSize: "0.75rem",
      color: "#94a3b8",
    },
    metric: {
      display: "flex",
      alignItems: "center",
      marginLeft: "12px",
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#3B82F6",
    },
    expandButton: {
      marginLeft: "8px",
      padding: "4px",
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      color: "#94a3b8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    userDetails: {
      padding: "12px 16px",
      backgroundColor: "#1E293B",
      borderBottomLeftRadius: "8px",
      borderBottomRightRadius: "8px",
    },
    detailItem: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
    },
    detailLabel: {
      fontSize: "0.75rem",
      color: "#94a3b8",
    },
    detailValue: {
      fontSize: "0.75rem",
      color: "#fff",
      fontWeight: "500",
    },
    currentUserPosition: {
      marginTop: "16px",
      padding: "12px",
      backgroundColor: "#1E293B",
      borderRadius: "8px",
      textAlign: "center",
    },
    positionText: {
      fontSize: "0.875rem",
      color: "#94a3b8",
      marginBottom: "4px",
    },
    positionValue: {
      fontSize: "1.25rem",
      fontWeight: "bold",
      color: "#fff",
      marginBottom: "4px",
    },
    positionInfo: {
      fontSize: "0.75rem",
      color: "#3B82F6",
    },
    emptyState: {
      padding: "32px 16px",
      textAlign: "center",
    },
    emptyStateText: {
      fontSize: "0.875rem",
      color: "#94a3b8",
    },
  }

  // Получаем стиль для позиции пользователя
  const getPositionStyle = (index) => {
    if (index === 0) return styles.positionTop1
    if (index === 1) return styles.positionTop2
    if (index === 2) return styles.positionTop3
    return styles.positionOther
  }

  // Получаем иконку для позиции пользователя
  const getPositionIcon = (index) => {
    if (index === 0) return <Crown size={14} />
    if (index === 1) return <Star size={14} />
    if (index === 2) return <Award size={14} />
    return null
  }

  // Находим позицию текущего пользователя
  const currentUserPosition = findUserPosition()

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
      {filteredUsers.length > 0 ? (
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
                      <span style={styles.detailValue}>{(user.balance || 0).toFixed(2)} 💎</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Рефералы:</span>
                      <span style={styles.detailValue}>{user.referral_count || 0} 👥</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Уровень:</span>
                      <span style={styles.detailValue}>{user.level || 1} ⭐</span>
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

      {/* Позиция текущего пользователя, если он не в топ-100 */}
      {currentUser && currentUserPosition === null && lastTopUser && (
        <div style={styles.currentUserPosition}>
          <p style={styles.positionText}>Ваша позиция в общем рейтинге</p>
          <p style={styles.positionValue}>Ниже топ-100</p>
          <p style={styles.positionInfo}>
            Вам нужно{" "}
            {activeTab === "balance"
              ? `набрать еще ${(lastTopUser.balance || 0) - (currentUser.balance || 0)} монет`
              : `привлечь еще ${(lastTopUser.referral_count || 0) - (currentUser.referral_count || 0)} рефералов`}
            , чтобы попасть в топ-100
          </p>
        </div>
      )}
    </div>
  )
}


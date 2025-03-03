const UserProfile = ({ user }) => {
  // Найдем и исправим формирование реферальной ссылки
  // Заменим строку с referralLink на:
  const telegramUser = user // Assuming 'user' prop is the telegram user object
  console.log("Generating referral link with telegram_id:", telegramUser?.id)
  const referralLink = `https://t.me/trteeeeeee_bot?start=${telegramUser?.id || ""}`

  // Добавляем отладочный вывод для проверки telegram_id
  console.log("DEBUG: Generating referral link with telegram_id:", telegramUser?.id)
  console.log("DEBUG: User object:", user)
  console.log("DEBUG: Telegram user object:", telegramUser)

  return (
    <div>
      {/* User Profile Information */}
      <h2>User Profile</h2>
      {user ? (
        <div>
          <p>Telegram ID: {user.telegram_id}</p>
          <p>Username: {user.username}</p>
          <p>First Name: {user.first_name}</p>
          <p>Last Name: {user.last_name}</p>

          {/* Реферальная система */}
          <h3>Referral System</h3>
          <div className="text-xs text-gray-400">Реферальная ссылка</div>
          <div className="p-2 text-sm bg-gray-900/50 rounded border border-gray-700/30 text-gray-300 font-mono break-all">
            {referralLink}
          </div>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  )
}

async function fetchReferralStats(telegramUser) {
  if (telegramUser?.id) {
    console.log("DEBUG: Fetching referral stats for telegram_id:", telegramUser.id)

    // Остальной код функции остается без изменений
  }
}

export default UserProfile


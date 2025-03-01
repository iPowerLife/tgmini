import { BottomMenu } from './components/bottom-menu'
import { ProfileSection } from './components/profile-section'
import { TasksSection } from './components/tasks-section'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { initTelegram } from './utils/telegram'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const tg = initTelegram()

  useEffect(() => {
    const loadUser = async () => {
      if (!tg?.initDataUnsafe?.user?.id) return

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', tg.initDataUnsafe.user.id)
          .single()

        if (error) throw error
        setUser(userData)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [tg?.initDataUnsafe?.user?.id])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="app min-h-screen bg-gray-900">
      <ProfileSection user={user} />
      <TasksSection user={user} onBalanceUpdate={(newBalance) => setUser(prev => ({ ...prev, balance: newBalance }))} />
      <BottomMenu />
    </div>
  )
}

export default App


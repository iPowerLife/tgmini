"use client"

import { CardContainer } from "../_components/ui/card-container"
import { User, Gem, Clock, Trophy, Star, Award, Target, Wallet, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useTelegramUser } from "../_lib/hooks/use-telegram-user"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"
import { useTelegram } from "../_components/telegram-provider"
import { ReferralStats } from "../_components/referral-stats"

interface WalletInfo {
  address: string
  balance: number
  isConnected: boolean
}

export default function ProfileClient() {
  const user = useTelegramUser()
  const telegram = useTelegram()
  const [wallet, setWallet] = useState<WalletInfo>({
    address: "",
    balance: 0,
    isConnected: false,
  })

  const stats = {
    totalMined: 1500,
    activeTime: "45 часов",
    efficiency: "92%",
    rank: 156,
    level: 5,
    experience: 2750,
    nextLevel: 3000,
    achievements: [
      { name: "Первый блок", description: "Найден первый блок", completed: true },
      { name: "Эффективность 90%", description: "Достигнута эффективность 90%", completed: true },
      { name: "24 часа онлайн", description: "Майнинг без перерыва 24 часа", completed: false },
    ],
    rewards: [
      { name: "Ежедневный бонус", amount: 100, claimed: false },
      { name: "Бонус за эффективность", amount: 50, claimed: true },
    ],
  }

  const handleConnectWallet = () => {
    // В реальном приложении здесь будет интеграция с Telegram Wallet API
    telegram.MainButton.text = "Подключить TON кошелек"
    telegram.MainButton.show()
    telegram.MainButton.onClick(() => {
      setWallet({
        address: "UQBFxHs...Kd8F",
        balance: 145.5,
        isConnected: true,
      })
      telegram.MainButton.hide()
    })
  }

  return (
    <div className="space-y-4">
      <CardContainer className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-primary/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
              {user.photoUrl ? (
                <Image
                  src={user.photoUrl || "/placeholder.svg"}
                  alt={user.displayName}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary/40" />
                </div>
              )}
            </div>
            <div>
              <h2 className="font-semibold">{user.displayName}</h2>
              {/* ID получается из Telegram Web App через хук useTelegramUser, 
                  который извлекает данные из telegram.WebApp.initDataUnsafe.user.id.
                  В режиме разработки возвращается ID по умолчанию: 0 */}
              <p className="text-sm text-[#999999]">ID: {user.id}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  <Star className="w-3 h-3 mr-1" />
                  Уровень {stats.level}
                </Badge>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-400/20">
                  <Trophy className="w-3 h-3 mr-1" />
                  Ранг #{stats.rank}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContainer>

      <CardContainer className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-primary/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Wallet className="h-5 w-5 text-purple-500" />
              </div>
              <h2 className="font-semibold">TON Кошелек</h2>
            </div>
            {wallet.isConnected && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Подключен
              </Badge>
            )}
          </div>

          {wallet.isConnected ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-black/20">
                <p className="text-xs text-[#999999]">Адрес кошелька</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-medium">{wallet.address}</p>
                  <ExternalLink className="w-4 h-4 text-[#999999]" />
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/20">
                <p className="text-xs text-[#999999]">Баланс</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-medium">{wallet.balance} TON</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-sm text-[#999999] mb-4">Подключите TON кошелек для вывода средств</p>
              <Button onClick={handleConnectWallet} className="w-full">
                <Wallet className="w-4 h-4 mr-2" />
                Подключить кошелек
              </Button>
            </div>
          )}
        </div>
      </CardContainer>

      <CardContainer className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent" />
        <div className="relative">
          <h3 className="text-sm font-semibold mb-3">Прогресс уровня</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#999999]">Опыт</span>
              <span>
                {stats.experience} / {stats.nextLevel}
              </span>
            </div>
            <Progress value={(stats.experience / stats.nextLevel) * 100} />
          </div>
        </div>
      </CardContainer>

      <div className="grid grid-cols-2 gap-4">
        <CardContainer className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent" />
          <div className="relative">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-yellow-500/10">
                  <Gem className="w-4 h-4 text-yellow-500" />
                </div>
                <span className="text-xs font-medium">Намайнено</span>
              </div>
              <p className="text-xl font-bold">{stats.totalMined}</p>
            </div>
          </div>
        </CardContainer>

        <CardContainer className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent" />
          <div className="relative">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-green-500/10">
                  <Clock className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-xs font-medium">Время работы</span>
              </div>
              <p className="text-xl font-bold">{stats.activeTime}</p>
            </div>
          </div>
        </CardContainer>
      </div>

      <CardContainer className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Award className="h-5 w-5 text-purple-500" />
              </div>
              <h2 className="font-semibold">Достижения</h2>
            </div>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
              {stats.achievements.filter((a) => a.completed).length}/{stats.achievements.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {stats.achievements.map((achievement, index) => (
              <div key={index} className="p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{achievement.name}</h3>
                    <p className="text-xs text-[#999999]">{achievement.description}</p>
                  </div>
                  {achievement.completed ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Выполнено
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      В процессе
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContainer>

      <CardContainer className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <h2 className="font-semibold">Награды</h2>
            </div>
          </div>

          <div className="space-y-3">
            {stats.rewards.map((reward, index) => (
              <div key={index} className="p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{reward.name}</h3>
                    <p className="text-xs text-[#999999]">+{reward.amount} монет</p>
                  </div>
                  {reward.claimed ? (
                    <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-400/20">
                      Получено
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Доступно
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContainer>

      <ReferralStats />
    </div>
  )
}


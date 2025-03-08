import { BottomMenu } from "../components/bottom-menu"

export default function HomePage({ user }) {
  return (
    <div className="min-h-screen bg-[#1A1F2E] pb-16">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-center text-white mb-6">Главная страница</h1>
        <div className="bg-[#242838] rounded-xl p-4 border border-[#2A3142]/70">
          <p className="text-white">Добро пожаловать в приложение!</p>
        </div>
      </div>
      <BottomMenu active="home" />
    </div>
  )
}


import { Home, ShoppingBag, Target, Trophy, User } from "lucide-react"
import Link from "next/link"

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 to-gray-900/95 backdrop-blur-sm border-t border-gray-800/50 z-50 pb-[env(safe-area-inset-bottom,20px)]">
      <nav className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        <Link href="/" className="flex flex-col items-center justify-center gap-1">
          <Home className="w-6 h-6 transition-colors duration-200" />
          <span className="text-xs font-medium transition-colors duration-200">Home</span>
        </Link>

        <Link href="/shop" className="flex flex-col items-center justify-center gap-1">
          <ShoppingBag className="w-6 h-6 transition-colors duration-200" />
          <span className="text-xs font-medium transition-colors duration-200">Shop</span>
        </Link>

        <Link href="/target" className="flex flex-col items-center justify-center gap-1">
          <Target className="w-6 h-6 transition-colors duration-200" />
          <span className="text-xs font-medium transition-colors duration-200">Target</span>
        </Link>

        <Link href="/trophy" className="flex flex-col items-center justify-center gap-1">
          <Trophy className="w-6 h-6 transition-colors duration-200" />
          <span className="text-xs font-medium transition-colors duration-200">Trophy</span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center justify-center gap-1">
          <User className="w-6 h-6 transition-colors duration-200" />
          <span className="text-xs font-medium transition-colors duration-200">Profile</span>
        </Link>
      </nav>
    </div>
  )
}


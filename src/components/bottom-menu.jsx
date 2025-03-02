import { Link, useLocation } from "react-router-dom"
import { HomeIcon, SearchIcon, PlusCircleIcon, HeartIcon, UserIcon } from "@heroicons/react/24/outline"

function BottomMenu() {
  const location = useLocation()

  const menuItems = [
    { path: "/", icon: HomeIcon, label: "Home" },
    { path: "/search", icon: SearchIcon, label: "Search" },
    { path: "/create", icon: PlusCircleIcon, label: "Create" },
    { path: "/favorites", icon: HeartIcon, label: "Favorites" },
    { path: "/profile", icon: UserIcon, label: "Profile" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 pb-[calc(env(safe-area-inset-bottom,0px)+80px)]">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} className="flex flex-col items-center">
            <item.icon className={`h-6 w-6 ${location.pathname === item.path ? "text-blue-500" : "text-gray-500"}`} />
            <span className={`text-xs ${location.pathname === item.path ? "text-blue-500" : "text-gray-500"}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default BottomMenu


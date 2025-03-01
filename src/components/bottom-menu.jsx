import { Home, Trophy, Target, User, ShoppingBag } from "lucide-react"

export function BottomMenu({ activeSection, onSectionChange }) {
  const menuItems = [
    { id: "home", icon: Home, label: "Главная" },
    { id: "shop", icon: ShoppingBag, label: "Магазин" },
    { id: "tasks", icon: Target, label: "Задания" },
    { id: "rating", icon: Trophy, label: "Рейтинг" },
    { id: "profile", icon: User, label: "Профиль" },
  ]

  return (
    <div className="bottom-menu">
      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            className={`menu-item ${activeSection === item.id ? "active" : ""}`}
            onClick={() => onSectionChange(item.id)}
          >
            <Icon className="menu-icon" size={24} />
            <span className="menu-label">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}


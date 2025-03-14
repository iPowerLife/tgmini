"use client"

export function CategoryNavigation({ activeCategory, onCategoryChange }) {
  const categories = [
    { id: "miners", name: "Майнеры", icon: "🖥️" },
    { id: "boosts", name: "Бусты", icon: "⚡" },
    { id: "special", name: "Особые", icon: "🎁" },
    { id: "premium", name: "Премиум", icon: "✨" },
  ]

  return (
    <div className="flex overflow-x-auto py-2 mb-4 no-scrollbar">
      <div className="flex space-x-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeCategory === category.id
                ? "bg-blue-600 text-white"
                : "bg-[#242838] text-gray-300 hover:bg-[#2A3142]"
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}


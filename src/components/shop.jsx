"use client"

import { useState } from "react"
import { supabase } from "../supabase"

export function Shop({ user, onPurchase, categories, models }) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || null)
  const [loading, setLoading] = useState(false)

  // Обработчик покупки
  const handlePurchase = async (modelId) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc("purchase_miner", {
        user_id_param: user.id,
        model_id_param: modelId,
        quantity_param: 1,
      })

      if (error) throw error

      if (data.success) {
        onPurchase(data.new_balance)
        alert("Майнер успешно куплен!")
      } else {
        alert(data.error || "Ошибка при покупке")
      }
    } catch (error) {
      console.error("Error purchasing miner:", error)
      alert("Ошибка при покупке майнера")
    } finally {
      setLoading(false)
    }
  }

  const filteredModels = models.filter((model) => model.category_id === selectedCategory)

  return (
    <div className="shop-container">
      <div className="categories">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
            disabled={loading}
          >
            {category.display_name}
          </button>
        ))}
      </div>

      <div className="models-grid">
        {filteredModels.map((model) => (
          <div key={model.id} className="model-card">
            <h3>{model.display_name}</h3>
            <p>{model.description}</p>
            <div className="stats">
              <div>Мощность: {model.mining_power}</div>
              <div>Энергия: {model.energy_consumption}</div>
            </div>
            <div className="price">💎 {model.price}</div>
            <button
              onClick={() => handlePurchase(model.id)}
              disabled={loading || user.balance < model.price}
              className={loading ? "loading" : ""}
            >
              {loading ? "Покупка..." : "Купить"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}


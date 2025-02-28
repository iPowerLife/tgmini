"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function Shop({ user, onPurchase }) {
  const [categories, setCategories] = useState([])
  const [models, setModels] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadShopData = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("miner_categories")
          .select("*")
          .order("id")

        if (categoriesError) throw categoriesError

        const { data: modelsData, error: modelsError } = await supabase
          .from("miner_models")
          .select("*")
          .order("category_id, price")

        if (modelsError) throw modelsError

        setCategories(categoriesData)
        setModels(modelsData)
        setSelectedCategory(categoriesData[0]?.id)
      } catch (error) {
        console.error("Error loading shop data:", error)
      }
    }

    loadShopData()
  }, [])

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

  return (
    <div className="shop-container">
      <div className="categories">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
          >
            {category.display_name}
          </button>
        ))}
      </div>

      <div className="models-grid">
        {models
          .filter((model) => model.category_id === selectedCategory)
          .map((model) => (
            <div key={model.id} className="model-card">
              <h3>{model.display_name}</h3>
              <p>{model.description}</p>
              <div className="stats">
                <div>Мощность: {model.mining_power}</div>
                <div>Энергия: {model.energy_consumption}</div>
              </div>
              <div className="price">💎 {model.price}</div>
              <button onClick={() => handlePurchase(model.id)} disabled={loading || user.balance < model.price}>
                {loading ? "Покупка..." : "Купить"}
              </button>
            </div>
          ))}
      </div>
    </div>
  )
}


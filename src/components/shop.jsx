"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function Shop({ user, onPurchase }) {
  const [categories, setCategories] = useState([])
  const [models, setModels] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadShopData = async () => {
      if (!user?.id) return // Проверяем наличие пользователя

      try {
        console.log("Loading shop data...")
        setLoading(true)
        setError(null)

        // Загружаем категории
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("miner_categories")
          .select("*")
          .order("id")

        if (categoriesError) {
          console.error("Error loading categories:", categoriesError)
          throw categoriesError
        }

        console.log("Loaded categories:", categoriesData)

        // Загружаем модели
        const { data: modelsData, error: modelsError } = await supabase
          .from("miner_models")
          .select("*")
          .order("category_id, price")

        if (modelsError) {
          console.error("Error loading models:", modelsError)
          throw modelsError
        }

        console.log("Loaded models:", modelsData)

        setCategories(categoriesData)
        setModels(modelsData)
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id)
        }
      } catch (err) {
        console.error("Error loading shop data:", err)
        setError("Ошибка загрузки данных магазина")
      } finally {
        setLoading(false)
      }
    }

    loadShopData()
  }, [user?.id]) // Добавляем зависимость от user.id

  const handlePurchase = async (modelId) => {
    if (!user?.id) return // Проверяем наличие пользователя

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

  if (!user) {
    return <div className="section-container">Пользователь не найден</div>
  }

  if (loading && !models.length) {
    return <div className="section-container">Загрузка магазина...</div>
  }

  if (error) {
    return <div className="section-container error">{error}</div>
  }

  if (!categories.length || !models.length) {
    return <div className="section-container">Товары в магазине отсутствуют</div>
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


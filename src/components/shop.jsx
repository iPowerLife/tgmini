"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export function Shop({ user, onPurchase }) {
  const [categories, setCategories] = useState([])
  const [models, setModels] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(false)

  // Загружаем категории и модели
  useEffect(() => {
    const loadShopData = async () => {
      try {
        // Загружаем категории
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("miner_categories")
          .select("*")
          .order("id")

        if (categoriesError) throw categoriesError

        // Загружаем модели
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

  // Покупка майнера
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
      {/* Категории */}
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

      {/* Модели майнеров */}
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

      <style jsx>{`
        .shop-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .categories {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .category-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.1);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-btn.active {
          background: rgba(99, 102, 241, 0.5);
        }

        .models-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .model-card {
          background: rgba(30, 41, 59, 0.7);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(99, 102, 241, 0.1);
        }

        .model-card h3 {
          margin: 0;
          color: #f8fafc;
        }

        .model-card p {
          color: #94a3b8;
          font-size: 0.9em;
          margin: 0;
        }

        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          font-size: 0.9em;
          color: #94a3b8;
        }

        .price {
          font-size: 1.2em;
          font-weight: bold;
          color: #4ade80;
          text-align: center;
        }

        button {
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.9);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        button:disabled {
          background: #1f2937;
          cursor: not-allowed;
        }

        button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </div>
  )
}

shop.jsx

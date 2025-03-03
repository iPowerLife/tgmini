"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { Skeleton } from "./skeleton"

function ShopItemSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function Shop({ user, onPurchase }) {
  const [categories, setCategories] = useState([])
  const [models, setModels] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadShopData = async () => {
      try {
        const { data: categoriesData } = await supabase.from("miner_categories").select("*").order("id")

        const { data: modelsData } = await supabase.from("miner_models").select("*").order("category_id, price")

        setCategories(categoriesData || [])
        setModels(modelsData || [])
        if (categoriesData?.length > 0) {
          setSelectedCategory(categoriesData[0].id)
        }
      } catch (error) {
        console.error("Error loading shop data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadShopData()
  }, [])

  const handlePurchase = async (modelId) => {
    try {
      const { data, error } = await supabase.rpc("purchase_miner", {
        user_id_param: user.id,
        model_id_param: modelId,
        quantity_param: 1,
      })

      if (error) throw error

      if (data.success) {
        onPurchase(data.new_balance)
      }
    } catch (error) {
      console.error("Error purchasing miner:", error)
    }
  }

  return (
    <div className="shop-container">
      <div className="categories">
        {loading ? (
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        ) : (
          categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
            >
              {category.display_name}
            </button>
          ))
        )}
      </div>

      <div className="models-grid">
        {loading ? (
          <>
            <ShopItemSkeleton />
            <ShopItemSkeleton />
            <ShopItemSkeleton />
            <ShopItemSkeleton />
          </>
        ) : (
          models
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
                <button onClick={() => handlePurchase(model.id)} disabled={user.balance < model.price}>
                  Купить
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  )
}


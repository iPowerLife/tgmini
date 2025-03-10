"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"
import Shop from "../components/shop"

const ShopPage = ({ user, onPurchase, initialData }) => {
  const [loading, setLoading] = useState(!initialData)
  const [categories, setCategories] = useState(initialData?.categories || [])
  const [models, setModels] = useState(initialData?.models || [])
  const [hasMinerPass, setHasMinerPass] = useState(initialData?.hasMinerPass || false)
  const [userMiners, setUserMiners] = useState(initialData?.userMiners || [])
  const isComponentMounted = useRef(true)

  // Загрузка данных магазина, если они не были переданы
  useEffect(() => {
    if (!user?.id) return

    isComponentMounted.current = true

    // Если данные уже переданы через props, не загружаем их снова
    if (initialData?.categories && initialData?.models) {
      return
    }

    const loadShopData = async () => {
      try {
        setLoading(true)

        // Загружаем категории и модели для магазина
        const [categoriesResponse, modelsResponse, minerPassResponse] = await Promise.all([
          supabase.from("miner_categories").select("*").order("id"),
          supabase.from("miner_models").select("*").order("category_id, price"),
          supabase.rpc("has_miner_pass", { user_id_param: user.id }),
        ])

        if (!isComponentMounted.current) return

        if (categoriesResponse.error) throw categoriesResponse.error
        if (modelsResponse.error) throw modelsResponse.error

        // Загружаем данные майнеров пользователя
        const { data: minersData, error: minersError } = await supabase
          .from("user_miners")
          .select("*")
          .eq("user_id", user.id)

        if (!isComponentMounted.current) return
        if (minersError) throw minersError

        setCategories(categoriesResponse.data || [])
        setModels(modelsResponse.data || [])
        setHasMinerPass(minerPassResponse.data || false)
        setUserMiners(minersData || [])
      } catch (error) {
        console.error("Error loading shop data:", error)
      } finally {
        if (isComponentMounted.current) {
          setLoading(false)
        }
      }
    }

    loadShopData()

    return () => {
      isComponentMounted.current = false
    }
  }, [user?.id, initialData])

  // Если пользователь не авторизован, не показываем ничего
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Shop
        user={user}
        onPurchase={onPurchase}
        categories={categories}
        models={models}
        hasMinerPass={hasMinerPass}
        isLoading={loading}
      />
    </div>
  )
}

export default ShopPage


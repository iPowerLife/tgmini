"use client"

import { useState, useEffect, Suspense } from "react"

/**
 * Компонент для ленивой загрузки других компонентов
 * @param {Object} props - Свойства компонента
 * @param {Function} props.loader - Функция для загрузки компонента
 * @param {React.ReactNode} props.fallback - Компонент для отображения во время загрузки
 * @param {Object} props.componentProps - Свойства для загружаемого компонента
 * @returns {React.ReactNode} - Загруженный компонент или fallback
 */
export function LazyComponent({ loader, fallback, componentProps = {} }) {
  const [Component, setComponent] = useState(null)

  useEffect(() => {
    let mounted = true

    const loadComponent = async () => {
      try {
        const module = await loader()
        if (mounted) {
          setComponent(() => module.default || module)
        }
      } catch (error) {
        console.error("Error loading component:", error)
      }
    }

    loadComponent()

    return () => {
      mounted = false
    }
  }, [loader])

  if (!Component) {
    return fallback || <div>Loading...</div>
  }

  return <Component {...componentProps} />
}

/**
 * HOC для создания ленивого компонента
 * @param {Function} loader - Функция для загрузки компонента
 * @param {React.ReactNode} fallback - Компонент для отображения во время загрузки
 * @returns {React.ComponentType} - Ленивый компонент
 */
export function withLazyLoading(loader, fallback) {
  return function LazyLoadedComponent(props) {
    return (
      <Suspense fallback={fallback || <div>Loading...</div>}>
        <LazyComponent loader={loader} componentProps={props} />
      </Suspense>
    )
  }
}


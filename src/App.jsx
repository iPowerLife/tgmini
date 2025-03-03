"use client"

import { BottomMenu } from "./components/bottom-menu"
import { Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from "react"

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    const content = document.querySelector(".page-content")
    if (content) {
      content.scrollTo(0, 0)
    }
  }, [])

  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <div className="page-content bg-gray-950 text-white">
        <Routes>
          <Route
            path="/"
            element={
              <div className="min-h-full flex items-center justify-center">
                <span className="text-2xl font-bold">Mining Game</span>
              </div>
            }
          />
          {/* Другие роуты */}
        </Routes>
      </div>
      <BottomMenu />
    </>
  )
}

export default App


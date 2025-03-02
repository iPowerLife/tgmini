"use client"

import { BottomMenu } from "./components/bottom-menu"
import { Routes, Route, useLocation } from "react-router-dom"
import { useEffect, useRef } from "react"

function App() {
  const location = useLocation()
  const rootRef = useRef(null)

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.scrollTop = 0
    }
  }, [])

  return (
    <div ref={rootRef} id="root" className="h-full overflow-y-auto">
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
    </div>
  )
}

module.exports = App


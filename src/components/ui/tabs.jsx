"use client"

import * as React from "react"

const TabsContext = React.createContext(null)

export function Tabs({ defaultValue, value, onValueChange, children, className = "" }) {
  const [selectedTab, setSelectedTab] = React.useState(value || defaultValue)

  const changeTab = React.useCallback(
    (newValue) => {
      setSelectedTab(newValue)
      onValueChange?.(newValue)
    },
    [onValueChange],
  )

  return (
    <TabsContext.Provider value={{ selectedTab, changeTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className = "" }) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-800/50 p-1 text-gray-400 ${className}`}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className = "" }) {
  const { selectedTab, changeTab } = React.useContext(TabsContext)
  const isSelected = selectedTab === value

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isSelected ? "bg-primary text-white shadow-sm" : ""
      } ${className}`}
      onClick={() => changeTab(value)}
      data-state={isSelected ? "active" : "inactive"}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className = "" }) {
  const { selectedTab } = React.useContext(TabsContext)

  if (selectedTab !== value) {
    return null
  }

  return <div className={`mt-2 ${className}`}>{children}</div>
}


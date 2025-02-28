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
  return <div className={`tabs-list ${className}`}>{children}</div>
}

export function TabsTrigger({ value, children, className = "" }) {
  const { selectedTab, changeTab } = React.useContext(TabsContext)
  const isSelected = selectedTab === value

  return (
    <button
      className={`tab-trigger ${isSelected ? "active" : ""} ${className}`}
      onClick={() => changeTab(value)}
      data-state={isSelected ? "active" : "inactive"}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children }) {
  const { selectedTab } = React.useContext(TabsContext)

  if (selectedTab !== value) {
    return null
  }

  return <div>{children}</div>
}


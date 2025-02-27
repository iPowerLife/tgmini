function App() {
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#1a1b1e",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <h1>Тестовая страница</h1>
      <p>Версия 1.0</p>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "10px",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          fontSize: "12px",
        }}
      >
        {new Date().toISOString()}
      </div>
    </div>
  )
}

export default App


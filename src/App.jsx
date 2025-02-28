// Максимально простая версия без внешних зависимостей
function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1b1e",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          width: "100%",
          maxWidth: "300px",
        }}
      >
        <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
          <span>Баланс:</span>
          <span>0.00 💎</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Мощность:</span>
          <span>1.0 ⚡</span>
        </div>
      </div>

      <button
        style={{
          width: "100%",
          maxWidth: "300px",
          padding: "15px",
          backgroundColor: "#3b82f6",
          border: "none",
          borderRadius: "12px",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Майнить ⛏️
      </button>
    </div>
  )
}

export default App


export function Stats({ balance, miningPower, level, experience, nextLevelExp }) {
  const progressPercent = ((experience / nextLevelExp) * 100).toFixed(1)

  return (
    <div
      className="stats"
      style={{
        padding: "15px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        marginBottom: "20px",
      }}
    >
      <div style={{ marginBottom: "10px" }}>
        <span style={{ color: "#888" }}>Баланс:</span>
        <span style={{ float: "right", color: "#4ade80" }}>{balance.toFixed(2)} 💎</span>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <span style={{ color: "#888" }}>Мощность майнинга:</span>
        <span style={{ float: "right", color: "#60a5fa" }}>{miningPower.toFixed(1)} ⚡</span>
      </div>

      <div style={{ marginBottom: "5px" }}>
        <span style={{ color: "#888" }}>Уровень {level}</span>
        <span style={{ float: "right", color: "#fbbf24" }}>
          {experience} / {nextLevelExp} ✨
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: "4px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: "100%",
            background: "#fbbf24",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  )
}


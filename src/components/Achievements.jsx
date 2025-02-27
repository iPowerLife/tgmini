export function Achievements({ achievements = [], onClose }) {
  console.log("Achievements component:", { achievements }) // Отладочная информация

  if (!achievements || achievements.length === 0) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "#1a1b1e",
            borderRadius: "12px",
            padding: "20px",
            width: "90%",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0 }}>Достижения 🏆</h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
          <p style={{ textAlign: "center", color: "#888" }}>Достижения загружаются...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#1a1b1e",
          borderRadius: "12px",
          padding: "20px",
          width: "90%",
          maxWidth: "400px",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0 }}>Достижения 🏆</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "grid", gap: "15px" }}>
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              style={{
                background: achievement.obtained ? "rgba(74, 222, 128, 0.1)" : "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "15px",
                display: "grid",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>{achievement.icon}</span>
                <div>
                  <div style={{ fontWeight: "bold" }}>{achievement.name}</div>
                  <div style={{ color: "#888", fontSize: "14px" }}>{achievement.description}</div>
                </div>
              </div>

              {achievement.obtained ? (
                <div style={{ color: "#4ade80", fontSize: "14px" }}>
                  ✓ Получено {new Date(achievement.obtained_at).toLocaleDateString()}
                </div>
              ) : (
                <div style={{ color: "#888", fontSize: "14px" }}>
                  Награда: +{achievement.reward_value} {achievement.reward_type === "mining_power" ? "⚡" : "💎"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


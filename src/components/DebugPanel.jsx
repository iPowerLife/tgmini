export function DebugPanel({ onTest, lastError }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: "#1a1b1e",
        padding: 10,
        borderRadius: 8,
        zIndex: 9999,
        maxWidth: "300px",
      }}
    >
      <button
        onClick={onTest}
        style={{
          padding: "8px 16px",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        Test Daily Bonus
      </button>

      {lastError && (
        <div
          style={{
            color: "#ff4444",
            fontSize: "12px",
            wordBreak: "break-word",
          }}
        >
          Last Error: {lastError}
        </div>
      )}
    </div>
  )
}


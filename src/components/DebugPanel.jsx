export function DebugPanel({ onTest }) {
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
        }}
      >
        Test Supabase
      </button>
    </div>
  )
}


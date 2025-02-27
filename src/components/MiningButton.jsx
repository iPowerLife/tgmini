export function MiningButton({ onMine, cooldown, isCooldown }) {
  return (
    <button
      onClick={onMine}
      disabled={isCooldown}
      style={{
        width: "100%",
        padding: "20px",
        fontSize: "18px",
        fontWeight: "bold",
        color: "white",
        background: isCooldown ? "#1f2937" : "#3b82f6",
        border: "none",
        borderRadius: "12px",
        cursor: isCooldown ? "not-allowed" : "pointer",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isCooldown ? (
        <>
          Перезарядка... ({cooldown}с)
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "4px",
              background: "#60a5fa",
              width: `${(cooldown / 3) * 100}%`,
              transition: "width 0.1s linear",
            }}
          />
        </>
      ) : (
        "Майнить 💎"
      )}
    </button>
  )
}


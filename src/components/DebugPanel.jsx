import { supabase } from "../supabaseClient"

export function DebugPanel({ userId, onTestBonus }) {
  const resetDailyBonus = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_bonuses")
        .delete()
        .eq("user_id", userId)
        .gte("claimed_at", new Date().toISOString().split("T")[0])

      if (error) {
        console.error("Error resetting bonus:", error)
        alert("Error resetting bonus: " + error.message)
        return
      }

      console.log("Reset result:", data)
      alert("Daily bonus reset successful!")
    } catch (error) {
      console.error("Error in resetDailyBonus:", error)
      alert("Error: " + error.message)
    }
  }

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
      <div style={{ marginBottom: 10, fontSize: 12, color: "#666" }}>User ID: {userId}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onTestBonus}
          style={{
            padding: "8px 16px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Test Bonus
        </button>
        <button
          onClick={resetDailyBonus}
          style={{
            padding: "8px 16px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Reset Bonus
        </button>
      </div>
    </div>
  )
}


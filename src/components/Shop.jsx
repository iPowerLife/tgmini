export function Shop({ items = [], userItems = [], balance = 0, onPurchase, onClose }) {
  console.log("Shop component rendered with:", {
    itemsCount: items.length,
    userItemsCount: userItems.length,
    balance,
  })

  if (!items || items.length === 0) {
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
            <h2 style={{ margin: 0 }}>Магазин 🏪</h2>
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

          <div
            style={{
              marginBottom: "20px",
              padding: "10px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            Ваш баланс: {balance.toFixed(2)} 💎
          </div>

          <div style={{ textAlign: "center", color: "#888" }}>Загрузка предметов...</div>
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
          <h2 style={{ margin: 0 }}>Магазин 🏪</h2>
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

        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          Ваш баланс: {balance.toFixed(2)} 💎
        </div>

        <div style={{ display: "grid", gap: "15px" }}>
          {items.map((item) => {
            const userItem = userItems.find((ui) => ui.item_id === item.id)
            const quantity = userItem?.quantity || 0
            const canBuy = balance >= item.price && quantity < item.max_quantity

            return (
              <div
                key={item.id}
                style={{
                  background: quantity > 0 ? "rgba(74, 222, 128, 0.1)" : "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  padding: "15px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "24px" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: "bold" }}>{item.name}</div>
                    <div style={{ color: "#888", fontSize: "14px" }}>{item.description}</div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <div style={{ color: "#888", fontSize: "14px" }}>Цена: {item.price} 💎</div>
                  {quantity > 0 ? (
                    <div style={{ color: "#4ade80", fontSize: "14px" }}>Куплено ✓</div>
                  ) : (
                    <button
                      onClick={() => onPurchase(item)}
                      disabled={!canBuy}
                      style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "white",
                        backgroundColor: canBuy ? "#3b82f6" : "#1f2937",
                        border: "none",
                        borderRadius: "8px",
                        cursor: canBuy ? "pointer" : "not-allowed",
                      }}
                    >
                      {canBuy ? "Купить" : "Недостаточно средств"}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


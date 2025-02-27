export function LoadingScreen({ message, subMessage }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        padding: "20px",
        backgroundColor: "#1a1b1e",
        color: "white",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "18px" }}>{message || "Загрузка приложения..."}</div>

      {/* Индикатор загрузки */}
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #3b82f6",
          borderTop: "3px solid transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />

      <div
        style={{
          color: "#666",
          fontSize: "14px",
        }}
      >
        {subMessage || "Подождите, игра запускается"}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}


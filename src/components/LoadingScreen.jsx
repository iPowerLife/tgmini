export function LoadingScreen({ message = "Загрузка...", error = null, retrying = false }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1a1b1e",
        color: "white",
        padding: "20px",
        textAlign: "center",
      }}
    >
      {error ? (
        <div style={{ color: "#ef4444" }}>
          <div style={{ fontSize: "18px", marginBottom: "10px" }}>Ошибка</div>
          <div style={{ fontSize: "14px", marginBottom: "20px" }}>{error}</div>
          {retrying && <div style={{ fontSize: "14px", color: "#60a5fa" }}>Пытаемся восстановить подключение...</div>}
        </div>
      ) : (
        <>
          <div style={{ fontSize: "18px", marginBottom: "20px" }}>{message}</div>
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
        </>
      )}
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


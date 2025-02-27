function App() {
  return (
    <div
      style={{
        backgroundColor: "#1a1b1e",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Тестовая страница</h1>
      <p>Если вы видите этот текст на тёмном фоне - приложение работает!</p>
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: "8px",
          maxWidth: "300px",
        }}
      >
        {window.Telegram?.WebApp ? (
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
            {JSON.stringify(
              {
                platform: window.Telegram.WebApp.platform,
                version: window.Telegram.WebApp.version,
                initDataUnsafe: window.Telegram.WebApp.initDataUnsafe,
              },
              null,
              2,
            )}
          </pre>
        ) : (
          "Telegram WebApp не доступен"
        )}
      </div>
    </div>
  )
}

export default App


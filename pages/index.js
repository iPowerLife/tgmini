import Script from "next/script"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Mining Game</h1>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-center">Welcome to Mining Game!</p>
        </div>
      </div>
    </div>
  )
}


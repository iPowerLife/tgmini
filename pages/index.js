import Head from "next/head"
import Script from "next/script"

export default function Home() {
  return (
    <>
      <Head>
        <title>Mining Game</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <main className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Mining Game</h1>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-center">Welcome to Mining Game!</p>
          </div>
        </div>
      </main>
    </>
  )
}


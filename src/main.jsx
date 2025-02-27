import { createRoot } from "react-dom/client"
import App from "./App.jsx"

console.log("main.jsx executing")

const container = document.getElementById("app")
console.log("Container found:", !!container)

const root = createRoot(container)
console.log("Root created")

root.render(<App />)

console.log("Render called")


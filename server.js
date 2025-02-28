const express = require("express")
const path = require("path")
const compression = require("compression")

const app = express()
const PORT = process.env.PORT || 3000

// Включаем сжатие gzip
app.use(compression())

// Раздаем статические файлы из папки dist
app.use(express.static(path.join(__dirname, "dist")))

// Все остальные запросы направляем на index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"))
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})


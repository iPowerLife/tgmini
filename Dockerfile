# Используем официальный образ Node.js
FROM node:18-slim

# Создаем директорию приложения
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем исходный код приложения
COPY . .

# Запускаем приложение
CMD ["npm", "start"]


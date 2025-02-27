# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production=false

# Копируем все файлы проекта
COPY . .

# Проверяем структуру проекта
RUN ls -la

# Собираем приложение
RUN npm run build

# Открываем порт
EXPOSE $PORT

# Запускаем приложение
CMD ["npm", "start"]


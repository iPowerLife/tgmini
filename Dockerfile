# Используем официальный образ Node.js LTS
FROM node:18-alpine as builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости для сборки
RUN apk add --no-cache python3 make g++

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (включая devDependencies)
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Второй этап - создаем финальный образ
FROM node:18-alpine

WORKDIR /app

# Копируем только необходимые файлы
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Открываем порт
EXPOSE $PORT

# Запускаем приложение
CMD ["npm", "start"]


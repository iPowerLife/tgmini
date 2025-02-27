# Используем Node.js 20
FROM node:20-alpine as builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Обновляем npm до последней версии
RUN npm install -g npm@latest

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости и исправляем уязвимости
RUN npm install && npm audit fix --force

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Создаем production образ
FROM node:20-alpine as runner

WORKDIR /app

# Копируем собранные файлы и зависимости
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Открываем порт
EXPOSE $PORT

# Запускаем приложение
CMD ["npm", "start"]


# Используем официальный образ Node.js
FROM node:20-alpine as builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем конфигурационные файлы
COPY package*.json .npmrc ./

# Устанавливаем зависимости с дополнительными проверками безопасности
RUN npm install -g npm@latest && \
    npm install && \
    npm audit fix --force && \
    npm prune --production

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Создаем production образ
FROM node:20-alpine as runner

WORKDIR /app

# Копируем собранные файлы и production зависимости
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Открываем порт
EXPOSE $PORT

# Запускаем приложение
CMD ["npm", "start"]


FROM node:20-alpine as builder

WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Создаем production образ
FROM node:20-alpine as runner

WORKDIR /app

# Копируем необходимые файлы
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./
COPY --from=builder /app/dist ./dist

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Проверяем наличие файлов
RUN ls -la && \
    echo "Content of current directory:" && \
    ls -R

# Открываем порт
EXPOSE 3000

# Запускаем сервер
CMD ["node", "server.js"]


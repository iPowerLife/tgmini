FROM node:20-alpine as builder

WORKDIR /app

# Копируем только файлы для установки зависимостей
COPY package.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы
COPY . .

# Собираем приложение
RUN npm run build

# Создаем production образ
FROM node:20-alpine as runner

WORKDIR /app

# Копируем только необходимые файлы
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Открываем порт
EXPOSE $PORT

# Запускаем приложение
CMD ["npm", "start"]


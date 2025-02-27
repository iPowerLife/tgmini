# Используем официальный образ Node.js LTS
FROM node:18-alpine as builder

# Создаем пользователя node
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости для сборки
RUN apk add --no-cache python3 make g++ git

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости с правильными правами
RUN npm install --location=global npm@latest
RUN npm install

# Копируем исходный код
COPY . .

# Меняем владельца файлов
RUN chown -R nextjs:nodejs /app

# Переключаемся на пользователя nextjs
USER nextjs

# Собираем приложение
RUN npm run build

# Второй этап - создаем финальный образ
FROM node:18-alpine as runner

# Создаем пользователя node
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем необходимые файлы от builder
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Устанавливаем только production зависимости
RUN npm install --production

# Переключаемся на пользователя nextjs
USER nextjs

# Открываем порт
EXPOSE $PORT

# Запускаем приложение
CMD ["npm", "start"]


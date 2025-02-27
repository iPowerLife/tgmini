# Используем фиксированную версию Node.js
FROM node:18.19.0-slim

# Устанавливаем конкретную версию npm
RUN npm install -g npm@10.2.4

# Создаем директорию приложения
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Очищаем кэш npm и устанавливаем зависимости
RUN npm cache clean --force && \
    npm install --no-package-lock

# Копируем исходный код приложения
COPY . .

# Устанавливаем переменные окружения для production
ENV NODE_ENV=production

# Запускаем приложение
CMD ["node", "bot.js"]


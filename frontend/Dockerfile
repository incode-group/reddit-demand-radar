# 1. Слой зависимостей
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

COPY package*.json ./
# Используем флаг, который спас нас в бэкенде
RUN npm install --legacy-peer-deps

# 2. Слой сборки
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Отключаем телеметрию Next.js для ускорения билда
ENV NEXT_TELEMETRY_DISABLED 1

# Билдим проект (здесь подтянутся те фиксы типов, которые мы делали)
RUN npm run build

# 3. Финальный образ (Runner)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Копируем только то, что нужно для запуска продакшена
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
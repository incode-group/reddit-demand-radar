# 1. Слой зависимостей
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++ openssl libssl1.1 || apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
# Ставим ВСЕ зависимости для билда (включая dev)
RUN npm install --legacy-peer-deps
# Генерируем клиент Prisma сразу
RUN npx prisma generate

# 2. Слой сборки (TypeScript -> JS)
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Компилируем TS в папку dist или build
RUN npm run build
# Чистим зависимости, оставляя только нужные для работы
RUN npm prune --production --legacy-peer-deps

# 3. Финальный образ (Runner)
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

# Копируем только то, что нужно для запуска
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist 
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000
CMD ["npm", "run", "start"]
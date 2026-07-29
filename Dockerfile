# Multi-stage Dockerfile para implantação no Easypanel (Fullstack)

# ─── Stage 1: Build Backend ──────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# ─── Stage 2: Build Frontend ─────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Stage 3: Production Runner ──────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV BACKEND_PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1

# Instala utilitário para execução paralela de serviços
RUN npm install -g concurrently

# Copia Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY --from=backend-builder /app/backend/dist ./dist

# Copia Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY --from=frontend-builder /app/frontend/.next ./.next
COPY --from=frontend-builder /app/frontend/public ./public
COPY --from=frontend-builder /app/frontend/next.config.js ./
COPY --from=frontend-builder /app/frontend/node_modules ./node_modules

WORKDIR /app

EXPOSE 3000 3001

CMD ["concurrently", "\"node /app/backend/dist/main\"", "\"npm --prefix /app/frontend start\""]

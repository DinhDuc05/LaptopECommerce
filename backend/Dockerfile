# ============================================================================
# MULTI-STAGE DOCKERFILE FOR BACKEND (OPTIMIZED FOR AWS T3.SMALL)
# Memory limit inside container: 256MB max-old-space-size
# Base: Node 20 Alpine (Minimal footprint ~120MB image)
# ============================================================================

# STAGE 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Cài đặt dependencies build
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy mã nguồn & build
COPY src ./src
COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build

# Loại bỏ devDependencies để giảm kích thước tối đa
RUN npm prune --production

# STAGE 2: Lightweight Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy chỉ các file cần thiết từ builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Tạo user không có quyền root để bảo mật
USER node

EXPOSE 5000

# BẮT BUỘC: Giới hạn cứng bộ nhớ heap 256MB để tránh OOM trên t3.small
CMD ["node", "--max-old-space-size=256", "dist/server.js"]

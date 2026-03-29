# ═══════════════════════════════════════════════
# FIRST TOUCH — Production Dockerfile
# ═══════════════════════════════════════════════

FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npx prisma generate

# Copy source code
COPY . .

# Create logs directory (uploads handled by Cloudinary)
RUN mkdir -p logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]

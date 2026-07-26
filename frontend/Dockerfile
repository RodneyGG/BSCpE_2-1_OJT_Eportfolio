# ============================================================
# Stage 1 — Install dependencies (cached layer)
# ============================================================
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy only package manifests first so npm ci is cached unless they change
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts && npm cache clean --force

# ============================================================
# Stage 2 — Development runner (used by docker compose)
# ============================================================
FROM node:22-alpine AS development
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development

# Expose Next.js dev server port

# Run as non-root for security — create .next dir first so node user owns it
RUN mkdir -p .next && chown -R node:node .next
USER node

CMD ["npm", "run", "dev"]

# ============================================================
# Stage 3 — Build the production bundle
# ============================================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build as standalone for production Docker deployment
ENV BUILD_STANDALONE=true
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============================================================
# Stage 4 — Minimal production runner
# ============================================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create dedicated non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what's needed to run — keeps the final image tiny
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
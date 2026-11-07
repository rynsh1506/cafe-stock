# Multi-stage Dockerfile for CafeStock (Elysia Backend + React Frontend + MySQL Support)
FROM oven/bun:1.2-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json bun.lock ./

# Install dependencies for compilation
RUN bun install --frozen-lockfile

# Copy application source code
COPY . .

# Build React Single Page Application into dist/
RUN bun run build

# Production Runner Stage
FROM oven/bun:1.2-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy node_modules and compiled artifacts from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/index.ts ./index.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose unified server port
EXPOSE 3000

# Run Elysia backend (serves API & dist/ on root /)
CMD ["bun", "run", "index.ts"]


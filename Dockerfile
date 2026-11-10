# Stage 1: Build all production assets (frontend SSR & backend bundle)
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Install workspace dependencies
COPY package.json bun.lock ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN bun install --frozen-lockfile

# Copy full source tree for compilation
COPY backend ./backend
COPY frontend ./frontend

# Build SvelteKit 5 SSR bundle (frontend/build) and Elysia backend bundle (backend/dist/index.js)
RUN bun run build

# Stage 2: Minimal Production Runtime (Only build outputs, ZERO raw source code!)
FROM oven/bun:1-alpine AS runner
WORKDIR /app

# Only copy compiled production artifacts and database migration SQL files
COPY --from=builder /app/backend/dist/index.js ./server.js
COPY --from=builder /app/backend/drizzle ./drizzle
COPY --from=builder /app/frontend/build ./frontend/build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create persistent data directory for standalone embedded database mode
RUN mkdir -p /app/data
VOLUME /app/data

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV MIGRATIONS_FOLDER=/app/drizzle
ENV FRONTEND_BUILD_DIR=/app/frontend/build
ENV DATA_DIR=/app/data/pgdata

EXPOSE 3000

CMD ["bun", "run", "server.js"]

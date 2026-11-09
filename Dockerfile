FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install workspace dependencies
COPY package.json bun.lock ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN bun install --frozen-lockfile

# Copy full monorepo source
COPY backend ./backend
COPY frontend ./frontend

# Build SvelteKit 5 SSR bundle (outputs to frontend/build)
RUN bun run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "--cwd=backend", "run", "start"]

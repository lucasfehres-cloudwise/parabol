FROM node:24-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built application (use pnpm build without --no-deps to bundle all JS deps)
COPY dist/ ./dist/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install only production dependencies needed for native modules (better-sqlite3, sharp)
RUN corepack enable pnpm && pnpm install --prod --frozen-lockfile --ignore-scripts \
    && pnpm rebuild better-sqlite3 \
    && apt-get purge -y python3 make g++ && apt-get autoremove -y

# Create data directory for SQLite
RUN mkdir -p /app/data

# Set environment for simple VM deployment
ENV DATABASE_DRIVER=sqlite
ENV SQLITE_DB_PATH=/app/data/parabol.sqlite
ENV BILLING_ENABLED=false
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/web.js"]

FROM node:24-slim

WORKDIR /app

# Copy built application
COPY dist/ ./dist/
COPY package.json ./

# Create data directory for SQLite
RUN mkdir -p /app/data

# Set environment for simple VM deployment
ENV DATABASE_DRIVER=sqlite
ENV SQLITE_DB_PATH=/app/data/parabol.sqlite
ENV BILLING_ENABLED=false
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/web.js"]

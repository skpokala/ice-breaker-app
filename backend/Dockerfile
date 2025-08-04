FROM node:18-alpine

# Add GHCR labels for proper package linking and permissions
LABEL org.opencontainers.image.source=https://github.com/skpokala/ice-breaker-app
LABEL org.opencontainers.image.description="Ice Breaker App Backend - Node.js API server"
LABEL org.opencontainers.image.licenses=MIT

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with production flag
RUN npm ci --only=production --verbose

# Verify installation (allow missing devDependencies)
RUN npm list --depth=0 --production || true

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Change ownership of the app directory
RUN chown -R backend:nodejs /app
USER backend

EXPOSE 8000

# Health check (updated for correct port)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"] 
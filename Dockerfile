# Use Node.js LTS version
FROM node:18-alpine

# Install system dependencies for audio generation
RUN apk add --no-cache \
    espeak \
    alsa-utils

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create data directory for JSON files (fallback if not using MongoDB)
RUN mkdir -p /app/data && \
    chmod 755 /app/data

# Create audio directory for Android TV compatibility
RUN mkdir -p /app/public/audio && \
    chmod 755 /app/public/audio

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]

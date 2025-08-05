# Lace & Allure Queue System - Portainer Stack

## Quick Deploy Instructions for Portainer

1. **Create a new Stack in Portainer**
2. **Copy and paste the docker-compose.yml content below**
3. **Customize environment variables if needed**
4. **Deploy the stack**

## Environment Variables

- `PORT`: Application port (default: 3000)
- `MONGODB_URL`: MongoDB connection string (default: mongodb://192.168.1.200:27017/lace-allure-queue)
- `USE_MONGODB`: Set to 'true' to use MongoDB, 'false' for JSON files (default: true)
- `NODE_ENV`: Environment (default: production)

## Features

✅ **Real-time queue management**
✅ **Socket.io for live updates**
✅ **Android TV audio compatibility**
✅ **MongoDB support with JSON fallback**
✅ **Product management system**
✅ **Follow-up system for orders**
✅ **Modern responsive UI**
✅ **Text-to-speech notifications**
✅ **Health checks included**

## Access

- **Main Application**: http://your-server:3000
- **Queue View**: http://your-server:3000/queue
- **Add Orders**: http://your-server:3000/add-queue
- **Admin Panel**: http://your-server:3000/admin

## Data Persistence

- **MongoDB**: All data stored in your MongoDB server at 192.168.1.200
- **Fallback**: JSON files in Docker volumes if MongoDB unavailable
- **Audio Files**: Temporary TTS audio files for Android TV compatibility

## Courier Options

- SPX, Flash, J&T, LEX, Ninja Van, Ximex, JT Cargo
- Walk-in Customer
- Custom courier option

## Docker Stack Configuration

```yaml
version: '3.8'

services:
  lace-allure-queue:
    build: .
    container_name: lace-allure-queue
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URL=mongodb://192.168.1.200:27017/lace-allure-queue
      - USE_MONGODB=true
    volumes:
      - queue_data:/app/data
      - audio_data:/app/public/audio
    restart: unless-stopped
    networks:
      - queue_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  queue_data:
    driver: local
  audio_data:
    driver: local

networks:
  queue_network:
    driver: bridge
```

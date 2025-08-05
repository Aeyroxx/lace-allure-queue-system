# 🎯 Deployment Guide for Portainer

## What's Ready for Deployment

Your **Lace & Allure Queue System** is now fully dockerized and ready for deployment on Portainer! Here's what has been created:

### 📁 Files Created
- ✅ `Dockerfile` - Multi-stage Node.js container with health checks
- ✅ `docker-compose.yml` - Complete stack configuration  
- ✅ `database.js` - MongoDB integration with JSON fallback
- ✅ `models/Product.js` & `models/QueueItem.js` - Mongoose schemas
- ✅ `server.js` - Completely rewritten for production deployment
- ✅ `package.json` - Updated with MongoDB dependencies
- ✅ `.env.example` - Environment configuration template
- ✅ `PORTAINER_DEPLOY.md` - Detailed deployment instructions

## 🚀 How to Deploy on Portainer

### Method 1: Upload as ZIP (Recommended)
1. **Zip the entire project folder** (`C:\Users\geela\OneDrive\Desktop\queu`)
2. **Go to your Portainer dashboard**
3. **Navigate to Stacks → Add Stack**
4. **Choose "Upload"** and upload your ZIP file
5. **Use this stack configuration:**

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
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
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

6. **Deploy the stack**

### Method 2: Git Repository
1. **Push your code to a Git repository**
2. **In Portainer: Stacks → Add Stack → Repository**
3. **Enter your repository URL**
4. **Use the same docker-compose configuration above**

## 🎯 What Will Work After Deployment

### ✅ Core Features
- **Real-time queue management** on port 3000
- **MongoDB integration** with your server at 192.168.1.200
- **Android TV audio compatibility** (server-side TTS)
- **Socket.io real-time updates**
- **Modern responsive UI**
- **Product management system**
- **Follow-up system for orders**

### 🌐 Access URLs
- **Main Dashboard**: `http://your-server-ip:3000`
- **Current Queue**: `http://your-server-ip:3000/queue`
- **Add Orders**: `http://your-server-ip:3000/add-queue`
- **Admin Panel**: `http://your-server-ip:3000/admin`

### 📦 Courier Options
- SPX, Flash, J&T, LEX, Ninja Van, Ximex, JT Cargo
- Walk-in Customer support
- Custom courier option

## 🔧 Configuration Notes

### Database
- **Primary**: MongoDB at `192.168.1.200:27017`
- **Fallback**: JSON files in Docker volumes
- **Auto-switching**: If MongoDB is unavailable, falls back to JSON

### Audio System
- **Android TV Compatible**: Server generates audio files
- **Web Browser**: Falls back to Web Speech API
- **No Duplication**: Fixed audio management system

### Health Monitoring
- **Health checks** every 30 seconds
- **Auto-restart** if container fails
- **Graceful startup** with 40-second grace period

## 🚨 Important Notes

1. **Make sure MongoDB is accessible** from your Portainer host
2. **Port 3000 should be available** on your server
3. **Audio files** will be temporarily stored in Docker volumes
4. **Data persistence** is handled through Docker volumes

## ✅ Ready to Deploy!

Everything is configured and ready. Just upload the project folder to Portainer and deploy using the stack configuration above. Your queue system will be live on port 3000 with full MongoDB integration and Android TV compatibility!

# 🐳 Portainer Deployment Guide

## Complete Step-by-Step Portainer Deployment for Lace & Allure Queue System

### 📋 Prerequisites

Before deploying in Portainer, ensure you have:
- ✅ **Portainer** installed and running
- ✅ **Port 3000** available on your server
- ✅ **Docker** installed on your Portainer host

---

## 🚀 Method 1: Deploy via GitHub Repository (Recommended)

### Step 1: Access Portainer
1. Open your **Portainer dashboard**
2. Navigate to **Stacks** → **Add Stack**

### Step 2: Create Stack from Repository
1. **Name your stack**: `lace-allure-queue`
2. **Build method**: Select **Repository**
3. **Repository URL**: 
   ```
   https://github.com/Aeyroxx/lace-allure-queue-system
   ```
4. **Reference**: `refs/heads/main`
5. **Compose path**: `docker-compose.yml`

### Step 3: Environment Variables (Optional)
Add these if you want to customize settings:
```env
NODE_ENV=production
PORT=3000
USE_MONGODB=false
```

### Step 4: Deploy
1. Click **Deploy the stack**
2. Wait for build and deployment to complete
3. Check **Containers** section to verify it's running

---

## 🚀 Method 2: Deploy via Docker Compose (Copy & Paste)

### Step 1: Create New Stack
1. Go to **Stacks** → **Add Stack**
2. **Name**: `lace-allure-queue`
3. **Build method**: Select **Web editor**

### Step 2: Paste Docker Compose Configuration
Copy and paste this complete configuration:

```yaml
version: '3.8'

services:
  lace-allure-queue:
    image: node:18-alpine
    container_name: lace-allure-queue
    working_dir: /app
    command: sh -c "npm install && npm start"
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - USE_MONGODB=false
    volumes:
      - ./:/app
      - queue_data:/app/data
      - audio_data:/app/public/audio
      - /app/node_modules
    restart: unless-stopped
    networks:
      - queue_network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  queue_data:
    driver: local
  audio_data:
    driver: local

networks:
  queue_network:
    driver: bridge
```

### Step 3: Deploy Stack
1. Click **Deploy the stack**
2. Monitor the **Logs** for build progress
3. Wait for "Server running on port 3000" message

---

## 🚀 Method 3: Pre-built Image Deployment

If you want to use a pre-built image, use this configuration:

```yaml
version: '3.8'

services:
  lace-allure-queue:
    build: 
      context: https://github.com/Aeyroxx/lace-allure-queue-system.git
      dockerfile: Dockerfile
    container_name: lace-allure-queue
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - USE_MONGODB=false
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

---

## 🔧 Configuration Options

### Environment Variables You Can Customize:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Application port |
| `NODE_ENV` | `production` | Environment mode |
| `USE_MONGODB` | `false` | Use MongoDB (true) or JSON files (false) |

### Custom Configuration Example:
```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  - USE_MONGODB=false
```

---

## 📊 Monitoring Your Deployment

### 1. Check Container Status
- Go to **Containers** in Portainer
- Look for `lace-allure-queue` container
- Status should be **Running** with green indicator

### 2. View Logs
- Click on container name
- Go to **Logs** tab
- Look for: `Server running on port 3000`

### 3. Health Check
- Container should show **Healthy** status
- Health check runs every 30 seconds

### 4. Access Application
- **URL**: `http://your-server-ip:3000`
- **Queue View**: `http://your-server-ip:3000/queue`
- **Add Orders**: `http://your-server-ip:3000/add-queue`
- **Admin Panel**: `http://your-server-ip:3000/admin`

---

## 🔧 Troubleshooting

### Container Won't Start
**Check logs for:**
```bash
# Common issues:
# 1. Port already in use
# 2. Missing dependencies
# 3. File permission issues
```

**Solutions:**
1. **Change port** in environment variables
2. **Check file permissions** for data directory
3. **Rebuild** with `docker-compose build --no-cache`

### Data Storage Issues
```yaml
# Ensure data persistence
volumes:
  - queue_data:/app/data
  - audio_data:/app/public/audio
```

### Audio Not Working
- Audio files are automatically generated for Android TV
- Check `/app/public/audio/` volume mount
- TTS requires server-side generation (already implemented)

### Performance Issues
```yaml
# Add resource limits
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

---

## 🔄 Updating Your Deployment

### Method 1: Redeploy Stack
1. Go to your stack in Portainer
2. Click **Editor**
3. Make changes if needed
4. Click **Update the stack**

### Method 2: Pull Latest Code
1. In Portainer, go to **Containers**
2. Select your container
3. Click **Recreate**
4. Enable **Pull latest image**

---

## 🚦 Health Monitoring

### Portainer Health Status
- **Green**: Container running and healthy
- **Yellow**: Container running but unhealthy
- **Red**: Container stopped or failed

### Application Health Check
```bash
# Manual health check
curl -f http://your-server:3000/
# Should return HTTP 200 OK
```

---

## 📱 Mobile Access

Your queue system will be accessible on mobile devices:
- **Responsive design** works on all screen sizes
- **Touch-friendly** interface for tablets
- **Android TV compatible** audio system

---

## 🎯 Quick Start Summary

1. **Open Portainer** → Stacks → Add Stack
2. **Choose method**: Repository or Web editor
3. **Use GitHub URL**: `https://github.com/Aeyroxx/lace-allure-queue-system`
4. **Deploy** and wait for completion
5. **Access**: `http://your-server:3000`

Your queue management system will be ready in just a few minutes! 🚀

---

## 📞 Support

If you encounter issues:
1. Check **container logs** in Portainer
2. Verify **MongoDB connectivity**
3. Ensure **port 3000** is not blocked
4. Review **health check status**

**Your Lace & Allure Queue System is now ready for production use!** 🎉

# 🏪 Lace & Allure Queue System

A modern, real-time queue management system built with Node.js for retail environments. Features Android TV compatibility, MongoDB integration, and Docker deployment ready for production use.

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Compatible-brightgreen.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

### 🔄 Real-time Queue Management
- **Live updates** using Socket.io for instant synchronization
- **Dual-section layout** with numbering for better organization
- **Status tracking**: Pending → In Progress → Done → Next Day
- **Follow-up system** for customer communication

### 🎵 Audio System (Android TV Compatible)
- **Server-side TTS** generation for Android TV compatibility
- **Web Speech API** fallback for modern browsers
- **Sound notifications** for new orders and status changes
- **No audio duplication** with centralized management

### 📱 Modern Responsive UI
- **Bootstrap 5** with modern design
- **Beige/Cream/Navy** color palette
- **Rounded corners** and smooth animations
- **Mobile-friendly** responsive design
- **Toast notifications** for user feedback

### 🚚 Comprehensive Courier Support
- **Major Couriers**: SPX, Flash, J&T, LEX, Ninja Van, Ximex, JT Cargo
- **Walk-in customers** support
- **Custom courier** option

### 🗄️ Flexible Database Options
- **MongoDB** primary database with connection pooling
- **JSON file** fallback for offline operation
- **Automatic switching** between database types
- **Data persistence** with Docker volumes

### 🐳 Production Ready
- **Docker containerization** with multi-stage builds
- **Health checks** and auto-restart capabilities
- **Environment configuration** support
- **Portainer compatible** for easy deployment

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aeyroxx/lace-allure-queue-system.git
   cd lace-allure-queue-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection if needed
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Access the application**
   - Main Dashboard: http://localhost:3000
   - Current Queue: http://localhost:3000/queue
   - Add Orders: http://localhost:3000/add-queue
   - Admin Panel: http://localhost:3000/admin

### � Docker Deployment

#### Using Docker Compose (Recommended)
```bash
# Clone and navigate to project
git clone https://github.com/Aeyroxx/lace-allure-queue-system.git
cd lace-allure-queue-system

# Deploy with Docker Compose
docker-compose up -d

# Access on port 3000
# http://your-server:3000
```

#### 🐳 Portainer Stack Deployment (Production Ready)

**Method 1: GitHub Repository (Easiest)**
1. **Portainer Dashboard** → **Stacks** → **Add Stack**
2. **Name**: `lace-allure-queue`
3. **Build method**: **Repository**
4. **Repository URL**: `https://github.com/Aeyroxx/lace-allure-queue-system`
5. **Reference**: `refs/heads/main`
6. **Compose path**: `docker-compose.yml`
7. **Deploy the stack**

**Method 2: Web Editor**
1. **Portainer Dashboard** → **Stacks** → **Add Stack**
2. **Name**: `lace-allure-queue`
3. **Build method**: **Web editor**
4. Copy the `docker-compose.yml` content from the repository
5. **Deploy the stack**

**Access**: `http://your-server-ip:3000`

📖 **Detailed Guide**: See `PORTAINER_DEPLOYMENT_GUIDE.md` for complete instructions

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Application port |
| `NODE_ENV` | `development` | Environment mode |
| `MONGODB_URL` | `mongodb://localhost:27017/lace-allure-queue` | MongoDB connection |
| `USE_MONGODB` | `true` | Use MongoDB (false for JSON files) |

### MongoDB Setup

```javascript
// Default connection string
mongodb://192.168.1.200:27017/lace-allure-queue

// Local development
mongodb://localhost:27017/lace-allure-queue
```

## 📋 Usage Guide

### For Staff (Add Orders)
1. Navigate to **Add to Queue** page
2. Select product and size
3. Choose quantity and courier
4. Add any special notes
5. Submit to queue

### For Management (Queue View)
1. Monitor **Current Queue** page
2. Update order status as needed
3. Use follow-up system for customer communication
4. View real-time updates automatically

### For Admins
1. Access **Admin Panel**
2. Manage products and sizes
3. Monitor system performance
4. Configure application settings

## 🏗️ Project Structure

```
lace-allure-queue/
├── 📄 server.js                    # Main Express server with Socket.io
├── 📄 database.js                  # Database abstraction layer
├── 📄 package.json                 # Dependencies and scripts
├── 📄 Dockerfile                   # Docker container configuration
├── 📄 docker-compose.yml           # Docker stack configuration
├── 📄 .env.example                 # Environment configuration template
├── 📁 models/                      # MongoDB schemas
│   ├── Product.js                  # Product data model
│   └── QueueItem.js               # Queue item data model
├── 📁 views/                       # EJS templates
│   ├── index.ejs                  # Home dashboard
│   ├── queue.ejs                  # Queue display page
│   ├── add-queue.ejs              # Add orders interface
│   └── admin.ejs                  # Admin panel
├── 📁 public/                      # Static assets
│   ├── css/
│   │   └── style.css              # Custom styling
│   ├── js/
│   │   ├── common.js              # Shared functionality
│   │   ├── queue.js               # Queue page logic
│   │   ├── add-queue.js           # Add queue logic
│   │   └── admin.js               # Admin panel logic
│   ├── audio/                     # TTS audio files (Android TV)
│   └── sounds/
│       └── notification.mp3       # Alert sounds
└── 📁 data/                       # JSON data storage (fallback)
    ├── products.json              # Product data
    └── queue.json                 # Queue data
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Real-time**: Socket.io for live updates
- **Database**: MongoDB (primary), JSON files (fallback)
- **Frontend**: EJS templates, Bootstrap 5, Vanilla JavaScript
- **Audio**: Web Speech API, Server-side TTS with 'say' package
- **Containerization**: Docker, Docker Compose
- **Deployment**: Portainer compatible

## 🔧 API Endpoints

### Queue Management
- `GET /` - Home dashboard
- `GET /queue` - Queue display page
- `GET /add-queue` - Add orders interface
- `GET /admin` - Admin panel

### REST API
- `GET /api/queue` - Get all queue items
- `POST /api/queue` - Add new queue item
- `PUT /api/queue/:id` - Update queue item
- `DELETE /api/queue/:id` - Delete queue item
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `DELETE /api/products/:id` - Delete product

### Audio (Android TV Support)
- `POST /api/audio/generate` - Generate TTS audio file
- `GET /audio/:filename` - Serve audio files

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Verify connection string in .env
MONGODB_URL=mongodb://192.168.1.200:27017/lace-allure-queue
```

**Audio Not Working on Android TV**
- Server automatically generates audio files for Android TV
- Check if 'say' package is installed: `npm install say`
- Audio files are stored in `/public/audio/` directory

**Port Already in Use**
```bash
# Change port in .env file
PORT=12026

# Or kill process using the port
npx kill-port 3000
```

**Docker Build Issues**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

## 📝 Development Guidelines

### Code Style
- Use ES6+ features where appropriate
- Follow camelCase naming convention
- Add comprehensive error handling
- Include JSDoc comments for complex functions

### Adding New Features
1. Update database models if needed
2. Add API endpoints in `server.js`
3. Create/update frontend templates
4. Add client-side JavaScript logic
5. Update Socket.io events for real-time features

### Testing
```bash
# Test server startup
npm start

# Test in multiple browser tabs for real-time features
# Test on different devices (desktop, mobile, Android TV)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for Lace & Allure business operations
- Inspired by modern queue management systems
- Special thanks to the Node.js and Socket.io communities

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the troubleshooting section above
- Review the deployment guides in `/docs/`

---

**Made with ❤️ for efficient queue management**
│   │   ├── common.js     # Shared functionality
│   │   ├── queue.js      # Queue management
│   │   ├── add-queue.js  # Add order functionality
│   │   └── admin.js      # Admin panel
│   └── sounds/
│       └── notification.mp3  # Notification sound
└── data/                 # JSON data storage
    ├── products.json     # Product definitions
    └── queue.json        # Queue items
```

## API Endpoints

### Queue Management
- `GET /api/queue` - Get all queue items
- `POST /api/queue` - Add new item to queue
- `PUT /api/queue/:id/status` - Update item status
- `POST /api/queue/:id/follow-up` - Add follow-up message
- `DELETE /api/queue/:id` - Remove item from queue

### Product Management
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `DELETE /api/products/:id` - Delete product

## Technologies Used

- **Backend**: Node.js, Express.js
- **Real-time**: Socket.io
- **Frontend**: EJS templating, Bootstrap 5, JavaScript
- **Icons**: Font Awesome
- **Data Storage**: JSON files
- **Dependencies**: 
  - `express` - Web framework
  - `socket.io` - Real-time communication
  - `uuid` - Unique ID generation
  - `cors` - Cross-origin resource sharing
  - `body-parser` - Request body parsing

## Development

### Adding New Features
1. Follow the existing code patterns
2. Use the established class structure for client-side JavaScript
3. Maintain Bootstrap styling consistency
4. Add Socket.io events for real-time updates

### Customization
- Modify `public/css/style.css` for styling changes
- Update EJS templates in `views/` for layout changes
- Extend API endpoints in `server.js`
- Add new JavaScript functionality in `public/js/`

## Production Deployment

1. **Environment Variables**
   - Set `PORT` environment variable for custom port
   - Configure any additional environment-specific settings

2. **Process Management**
   - Use PM2 or similar for production process management
   - Implement proper logging and monitoring

3. **Database Migration**
   - Consider migrating from JSON files to a proper database for production use
   - Implement data backup and recovery procedures

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile responsive design

## Contributing

1. Follow the existing code structure and naming conventions
2. Test real-time functionality across multiple browser tabs
3. Ensure mobile responsiveness
4. Add appropriate error handling
5. Update documentation for new features

## License

ISC License - see package.json for details

## Support

For support and questions, please refer to the system administrator or development team.

---

**Lace and Allure Queue System** - Efficient order management for your business operations.

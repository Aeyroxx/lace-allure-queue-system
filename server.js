const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const bodyParser = require('body-parser');
const say = require('say');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Data file paths
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const QUEUE_FILE = path.join(__dirname, 'data', 'queue.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files
if (!fs.existsSync(PRODUCTS_FILE)) {
    const defaultProducts = [
        {
            id: uuidv4(),
            name: "Embroidery",
            sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL"],
            colors: [
                "Mocca-Mocca",
                "Mocca-Black",
                "Black-Mocca",
                "Mocca-Brown",
                "Mocca-Mocca(Floral)"
            ]
        },
        {
            id: uuidv4(),
            name: "DTF",
            sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL"],
            colors: [
                "White",
                "Black",
                "Gray",
                "Navy",
                "Red"
            ]
        }
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(defaultProducts, null, 2));
}

if (!fs.existsSync(QUEUE_FILE)) {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify([], null, 2));
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helper functions
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/queue', (req, res) => {
    const queue = readJsonFile(QUEUE_FILE);
    res.render('queue', { queue });
});

app.get('/add-queue', (req, res) => {
    const products = readJsonFile(PRODUCTS_FILE);
    res.render('add-queue', { products });
});

app.get('/admin', (req, res) => {
    const products = readJsonFile(PRODUCTS_FILE);
    res.render('admin', { products });
});

// API Routes
app.get('/api/products', (req, res) => {
    const products = readJsonFile(PRODUCTS_FILE);
    res.json(products);
});

app.post('/api/products', (req, res) => {
    const { name, sizes, colors } = req.body;
    
    if (!name || !sizes || !colors) {
        return res.status(400).json({ error: 'Name, sizes, and colors are required' });
    }
    
    const products = readJsonFile(PRODUCTS_FILE);
    const newProduct = {
        id: uuidv4(),
        name,
        sizes: Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim()),
        colors: Array.isArray(colors) ? colors : colors.split(',').map(c => c.trim())
    };
    
    products.push(newProduct);
    
    if (writeJsonFile(PRODUCTS_FILE, products)) {
        res.json(newProduct);
    } else {
        res.status(500).json({ error: 'Failed to save product' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const products = readJsonFile(PRODUCTS_FILE);
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (writeJsonFile(PRODUCTS_FILE, filteredProducts)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

app.get('/api/queue', (req, res) => {
    const queue = readJsonFile(QUEUE_FILE);
    res.json(queue);
});

app.post('/api/queue', (req, res) => {
    const { productName, size, color, quantity, courier, notes, status } = req.body;
    
    if (!productName || !size || !quantity || !courier) {
        return res.status(400).json({ error: 'Product name, size, quantity, and courier are required' });
    }
    
    const queue = readJsonFile(QUEUE_FILE);
    const newItem = {
        id: uuidv4(),
        productName,
        size,
        color: color || '',
        quantity: parseInt(quantity),
        courier,
        notes: notes || '',
        status: status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        followUps: []
    };
    
    queue.push(newItem);
    
    if (writeJsonFile(QUEUE_FILE, queue)) {
        // Emit to all clients
        io.emit('new-queue-item', newItem);
        res.json(newItem);
    } else {
        res.status(500).json({ error: 'Failed to save queue item' });
    }
});

app.put('/api/queue/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const queue = readJsonFile(QUEUE_FILE);
    const itemIndex = queue.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Queue item not found' });
    }
    
    queue[itemIndex].status = status;
    queue[itemIndex].updatedAt = new Date().toISOString();
    
    if (writeJsonFile(QUEUE_FILE, queue)) {
        const updatedItem = queue[itemIndex];
        io.emit('queue-item-updated', updatedItem);
        res.json(updatedItem);
    } else {
        res.status(500).json({ error: 'Failed to update queue item' });
    }
});

app.post('/api/queue/:id/follow-up', (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    
    const queue = readJsonFile(QUEUE_FILE);
    const itemIndex = queue.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Queue item not found' });
    }
    
    const followUp = {
        id: uuidv4(),
        message,
        timestamp: new Date().toISOString()
    };
    
    if (!queue[itemIndex].followUps) {
        queue[itemIndex].followUps = [];
    }
    
    queue[itemIndex].followUps.push(followUp);
    queue[itemIndex].updatedAt = new Date().toISOString();
    
    if (writeJsonFile(QUEUE_FILE, queue)) {
        const updatedItem = queue[itemIndex];
        io.emit('queue-item-updated', updatedItem);
        res.json(updatedItem);
    } else {
        res.status(500).json({ error: 'Failed to add follow-up' });
    }
});

app.delete('/api/queue/:id', (req, res) => {
    const { id } = req.params;
    const queue = readJsonFile(QUEUE_FILE);
    const filteredQueue = queue.filter(item => item.id !== id);
    
    if (writeJsonFile(QUEUE_FILE, filteredQueue)) {
        io.emit('queue-item-deleted', { id });
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to delete queue item' });
    }
});

// TTS Audio generation for Android TV compatibility
app.post('/api/generate-audio', (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    
    const audioDir = path.join(__dirname, 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
    }
    
    const filename = `tts_${Date.now()}.wav`;
    const outputPath = path.join(audioDir, filename);
    
    // Use 'say' library for cross-platform TTS
    say.export(message, null, 1.0, outputPath, (err) => {
        if (err) {
            console.error('TTS Error:', err);
            return res.status(500).json({ error: 'Failed to generate audio' });
        }
        
        res.json({ 
            audioUrl: `/audio/${filename}`,
            message: message
        });
        
        // Clean up old audio files after 5 minutes
        setTimeout(() => {
            try {
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
            } catch (error) {
                console.error('Error cleaning up audio file:', error);
            }
        }, 5 * 60 * 1000);
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Lace & Allure Queue System running on port ${PORT}`);
    console.log(`📂 Data storage: JSON files`);
    console.log(`🎵 TTS Audio: ${say ? 'Available' : 'Not available'}`);
    console.log(`🌐 Access: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

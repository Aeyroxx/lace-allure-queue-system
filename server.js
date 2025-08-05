const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const bodyParser = require('body-parser');
const say = require('say');
const DatabaseManager = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize database manager
const db = new DatabaseManager();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', async (req, res) => {
    res.render('index');
});

app.get('/queue', async (req, res) => {
    try {
        const queue = await db.getQueue();
        res.render('queue', { queue });
    } catch (error) {
        console.error('Error loading queue:', error);
        res.render('queue', { queue: [] });
    }
});

// TTS Audio generation for Android TV compatibility
app.post('/api/generate-audio', (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const audioId = uuidv4();
    const audioPath = path.join(__dirname, 'public', 'audio', `${audioId}.wav`);
    
    // Generate speech using server-side TTS
    say.export(message, null, 0.8, audioPath, (err) => {
        if (err) {
            console.error('TTS Error:', err);
            return res.status(500).json({ error: 'Failed to generate audio' });
        }
        
        // Return the audio file URL
        res.json({ 
            audioUrl: `/audio/${audioId}.wav`,
            audioId: audioId 
        });
    });
});

// Clean up old audio files endpoint
app.delete('/api/cleanup-audio/:audioId', (req, res) => {
    const { audioId } = req.params;
    const audioPath = path.join(__dirname, 'public', 'audio', `${audioId}.wav`);
    
    try {
        if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Audio cleanup error:', error);
        res.status(500).json({ error: 'Failed to cleanup audio' });
    }
});

app.get('/add-queue', async (req, res) => {
    try {
        const products = await db.getProducts();
        res.render('add-queue', { products });
    } catch (error) {
        console.error('Error loading products:', error);
        res.render('add-queue', { products: [] });
    }
});

app.get('/admin', async (req, res) => {
    try {
        const products = await db.getProducts();
        res.render('admin', { products });
    } catch (error) {
        console.error('Error loading products:', error);
        res.render('admin', { products: [] });
    }
});

// API Routes
app.get('/api/queue', async (req, res) => {
    try {
        const queue = await db.getQueue();
        res.json(queue);
    } catch (error) {
        console.error('Error fetching queue:', error);
        res.status(500).json({ error: 'Failed to fetch queue' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await db.getProducts();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, sizes, colors } = req.body;
        const productData = {
            name,
            sizes: sizes || ['S', 'M', 'L', 'XL'],
            colors: colors || ['Black', 'White', 'Red', 'Blue']
        };
        
        const newProduct = await db.addProduct(productData);
        const allProducts = await db.getProducts();
        
        io.emit('products-updated', allProducts);
        res.json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await db.deleteProduct(id);
        
        if (deletedProduct) {
            const allProducts = await db.getProducts();
            io.emit('products-updated', allProducts);
            res.json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

app.post('/api/queue', async (req, res) => {
    try {
        const { productId, productName, size, color, quantity, courier } = req.body;
        
        const queueData = {
            productId,
            productName,
            size,
            color,
            quantity: parseInt(quantity),
            courier,
            status: 'pending'
        };
        
        const newQueueItem = await db.addQueueItem(queueData);
        const allQueue = await db.getQueue();
        
        // Emit new queue item to all connected clients
        io.emit('new-queue-item', newQueueItem);
        io.emit('queue-updated', allQueue);
        
        res.json(newQueueItem);
    } catch (error) {
        console.error('Error adding queue item:', error);
        res.status(500).json({ error: 'Failed to add queue item' });
    }
});

app.put('/api/queue/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const updatedItem = await db.updateQueueItemStatus(id, status);
        
        if (updatedItem) {
            const allQueue = await db.getQueue();
            io.emit('queue-updated', allQueue);
            io.emit('status-updated', { id, status });
            res.json(updatedItem);
        } else {
            res.status(404).json({ error: 'Queue item not found' });
        }
    } catch (error) {
        console.error('Error updating queue item status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

app.post('/api/queue/:id/follow-up', async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        
        const updatedItem = await db.addFollowUp(id, message);
        
        if (updatedItem) {
            const followUp = updatedItem.followUps[updatedItem.followUps.length - 1];
            const allQueue = await db.getQueue();
            
            io.emit('follow-up-added', { queueItemId: id, followUp });
            io.emit('queue-updated', allQueue);
            res.json(updatedItem);
        } else {
            res.status(404).json({ error: 'Queue item not found' });
        }
    } catch (error) {
        console.error('Error adding follow-up:', error);
        res.status(500).json({ error: 'Failed to add follow-up' });
    }
});

app.delete('/api/queue/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await db.deleteQueueItem(id);
        
        if (deletedItem) {
            const allQueue = await db.getQueue();
            io.emit('queue-updated', allQueue);
            res.json({ message: 'Queue item deleted successfully' });
        } else {
            res.status(404).json({ error: 'Queue item not found' });
        }
    } catch (error) {
        console.error('Error deleting queue item:', error);
        res.status(500).json({ error: 'Failed to delete queue item' });
    }
});

// Socket.io connection handling
io.on('connection', async (socket) => {
    console.log('A user connected:', socket.id);
    
    // Send current queue to newly connected client
    try {
        const currentQueue = await db.getQueue();
        socket.emit('queue-updated', currentQueue);
    } catch (error) {
        console.error('Error sending initial queue:', error);
        socket.emit('queue-updated', []);
    }
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Initialize database and start server
async function startServer() {
    try {
        await db.initialize();
        console.log('📦 Database initialized successfully');
        
        const PORT = process.env.PORT || 12025;
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Lace and Allure Queue System running on port ${PORT}`);
            console.log(`🌐 Visit http://localhost:${PORT} to access the application`);
            console.log(`🐳 Docker ready - accessible on port 12025`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

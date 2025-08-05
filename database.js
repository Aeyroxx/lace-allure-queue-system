const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB Models
const Product = require('./models/Product');
const QueueItem = require('./models/QueueItem');

// File paths for JSON fallback
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const QUEUE_FILE = path.join(__dirname, 'data', 'queue.json');

class DatabaseManager {
    constructor() {
        this.useMongoDb = process.env.USE_MONGODB === 'true' && process.env.MONGODB_URL;
        this.mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/lace-allure-queue';
        this.isConnected = false;
    }

    async initialize() {
        if (this.useMongoDb) {
            try {
                await this.connectMongoDB();
                console.log('✅ Using MongoDB for data storage');
                return true;
            } catch (error) {
                console.error('❌ MongoDB connection failed, falling back to JSON files:', error.message);
                this.useMongoDb = false;
            }
        }
        
        console.log('📁 Using JSON files for data storage');
        this.initializeJsonFiles();
        return true;
    }

    async connectMongoDB() {
        await mongoose.connect(this.mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        this.isConnected = true;
        console.log('🔗 Connected to MongoDB at:', this.mongoUrl);
    }

    initializeJsonFiles() {
        // Ensure data directory exists
        if (!fs.existsSync(path.dirname(PRODUCTS_FILE))) {
            fs.mkdirSync(path.dirname(PRODUCTS_FILE), { recursive: true });
        }
        
        // Initialize files if they don't exist
        if (!fs.existsSync(PRODUCTS_FILE)) {
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
        }
        
        if (!fs.existsSync(QUEUE_FILE)) {
            fs.writeFileSync(QUEUE_FILE, JSON.stringify([], null, 2));
        }
    }

    // Product methods
    async getProducts() {
        if (this.useMongoDb && this.isConnected) {
            return await Product.find().sort({ createdAt: -1 });
        } else {
            return this.readJsonFile(PRODUCTS_FILE);
        }
    }

    async addProduct(productData) {
        if (this.useMongoDb && this.isConnected) {
            const product = new Product(productData);
            return await product.save();
        } else {
            const products = this.readJsonFile(PRODUCTS_FILE);
            const newProduct = {
                _id: require('uuid').v4(),
                ...productData,
                createdAt: new Date().toISOString()
            };
            products.push(newProduct);
            this.writeJsonFile(PRODUCTS_FILE, products);
            return newProduct;
        }
    }

    async deleteProduct(productId) {
        if (this.useMongoDb && this.isConnected) {
            return await Product.findByIdAndDelete(productId);
        } else {
            const products = this.readJsonFile(PRODUCTS_FILE);
            const index = products.findIndex(p => p._id === productId || p.id === productId);
            if (index > -1) {
                const deleted = products.splice(index, 1)[0];
                this.writeJsonFile(PRODUCTS_FILE, products);
                return deleted;
            }
            return null;
        }
    }

    // Queue methods
    async getQueue() {
        if (this.useMongoDb && this.isConnected) {
            return await QueueItem.find({ status: { $ne: 'done' } }).sort({ createdAt: 1 });
        } else {
            const queue = this.readJsonFile(QUEUE_FILE);
            return queue.filter(item => item.status !== 'done');
        }
    }

    async addQueueItem(queueData) {
        if (this.useMongoDb && this.isConnected) {
            const queueItem = new QueueItem(queueData);
            return await queueItem.save();
        } else {
            const queue = this.readJsonFile(QUEUE_FILE);
            const newQueueItem = {
                id: require('uuid').v4(),
                ...queueData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            queue.push(newQueueItem);
            this.writeJsonFile(QUEUE_FILE, queue);
            return newQueueItem;
        }
    }

    async updateQueueItemStatus(itemId, status) {
        if (this.useMongoDb && this.isConnected) {
            return await QueueItem.findByIdAndUpdate(
                itemId, 
                { status, updatedAt: new Date() }, 
                { new: true }
            );
        } else {
            const queue = this.readJsonFile(QUEUE_FILE);
            const item = queue.find(q => q.id === itemId);
            if (item) {
                item.status = status;
                item.updatedAt = new Date().toISOString();
                this.writeJsonFile(QUEUE_FILE, queue);
                return item;
            }
            return null;
        }
    }

    async addFollowUp(itemId, followUpMessage) {
        const followUp = {
            message: followUpMessage,
            timestamp: new Date().toISOString()
        };

        if (this.useMongoDb && this.isConnected) {
            return await QueueItem.findByIdAndUpdate(
                itemId,
                { 
                    $push: { followUps: followUp },
                    updatedAt: new Date()
                },
                { new: true }
            );
        } else {
            const queue = this.readJsonFile(QUEUE_FILE);
            const item = queue.find(q => q.id === itemId);
            if (item) {
                if (!item.followUps) item.followUps = [];
                item.followUps.push(followUp);
                item.updatedAt = new Date().toISOString();
                this.writeJsonFile(QUEUE_FILE, queue);
                return item;
            }
            return null;
        }
    }

    async deleteQueueItem(itemId) {
        if (this.useMongoDb && this.isConnected) {
            return await QueueItem.findByIdAndDelete(itemId);
        } else {
            const queue = this.readJsonFile(QUEUE_FILE);
            const index = queue.findIndex(q => q.id === itemId);
            if (index > -1) {
                const deleted = queue.splice(index, 1)[0];
                this.writeJsonFile(QUEUE_FILE, queue);
                return deleted;
            }
            return null;
        }
    }

    // JSON file helpers
    readJsonFile(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error);
            return [];
        }
    }

    writeJsonFile(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error writing ${filePath}:`, error);
        }
    }
}

module.exports = DatabaseManager;

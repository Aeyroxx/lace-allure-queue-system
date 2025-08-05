const fs = require('fs');
const path = require('path');

// File paths for JSON storage
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const QUEUE_FILE = path.join(__dirname, 'data', 'queue.json');

class DatabaseManager {
    constructor() {
        this.useMongoDb = false; // Always use JSON files
        this.isConnected = false;
    }

    async initialize() {
        console.log('📁 Using JSON files for data storage');
        this.initializeJsonFiles();
        return true;
    }

    initializeJsonFiles() {
        // Ensure data directory exists
        if (!fs.existsSync(path.dirname(PRODUCTS_FILE))) {
            fs.mkdirSync(path.dirname(PRODUCTS_FILE), { recursive: true });
        }

        // Initialize products file if it doesn't exist
        if (!fs.existsSync(PRODUCTS_FILE)) {
            const defaultProducts = [
                {
                    id: "default-product-1",
                    name: "Embroidery",
                    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL"],
                    colors: [
                        "Mocca-Mocca",
                        "Mocca-Black", 
                        "Black-Mocca",
                        "Mocca-Brown",
                        "Mocca-Mocca(Floral)"
                    ],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(defaultProducts, null, 2));
        }

        // Initialize queue file if it doesn't exist
        if (!fs.existsSync(QUEUE_FILE)) {
            fs.writeFileSync(QUEUE_FILE, JSON.stringify([], null, 2));
        }
        
        console.log('✅ JSON files initialized successfully');
    }

    // Product methods
    async getProducts() {
        try {
            const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading products:', error);
            return [];
        }
    }

    async addProduct(productData) {
        try {
            const products = await this.getProducts();
            const newProduct = {
                ...productData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            products.push(newProduct);
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
            return newProduct;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            const products = await this.getProducts();
            const filteredProducts = products.filter(p => p.id !== productId);
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(filteredProducts, null, 2));
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    // Queue methods
    async getQueue() {
        try {
            const data = fs.readFileSync(QUEUE_FILE, 'utf8');
            const queue = JSON.parse(data);
            // Filter out completed items that are older than 24 hours
            const filtered = queue.filter(item => {
                if (item.status === 'done') {
                    const completedTime = new Date(item.updatedAt);
                    const now = new Date();
                    const hoursDiff = (now - completedTime) / (1000 * 60 * 60);
                    return hoursDiff < 24;
                }
                return true;
            });
            
            if (filtered.length !== queue.length) {
                fs.writeFileSync(QUEUE_FILE, JSON.stringify(filtered, null, 2));
            }
            
            return filtered;
        } catch (error) {
            console.error('Error reading queue:', error);
            return [];
        }
    }

    async addQueueItem(queueData) {
        try {
            const queue = await this.getQueue();
            const newItem = {
                ...queueData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                followUps: []
            };
            queue.push(newItem);
            fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
            return newItem;
        } catch (error) {
            console.error('Error adding queue item:', error);
            throw error;
        }
    }

    async updateQueueItemStatus(itemId, status) {
        try {
            const queue = await this.getQueue();
            const itemIndex = queue.findIndex(item => item.id === itemId);
            
            if (itemIndex === -1) {
                throw new Error('Queue item not found');
            }
            
            queue[itemIndex].status = status;
            queue[itemIndex].updatedAt = new Date().toISOString();
            
            fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
            return queue[itemIndex];
        } catch (error) {
            console.error('Error updating queue item status:', error);
            throw error;
        }
    }

    async addFollowUp(itemId, followUpMessage) {
        try {
            const queue = await this.getQueue();
            const itemIndex = queue.findIndex(item => item.id === itemId);
            
            if (itemIndex === -1) {
                throw new Error('Queue item not found');
            }
            
            if (!queue[itemIndex].followUps) {
                queue[itemIndex].followUps = [];
            }
            
            const followUp = {
                id: Date.now().toString(),
                message: followUpMessage,
                timestamp: new Date().toISOString()
            };
            
            queue[itemIndex].followUps.push(followUp);
            queue[itemIndex].updatedAt = new Date().toISOString();
            
            fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
            return queue[itemIndex];
        } catch (error) {
            console.error('Error adding follow-up:', error);
            throw error;
        }
    }

    async deleteQueueItem(itemId) {
        try {
            const queue = await this.getQueue();
            const filteredQueue = queue.filter(item => item.id !== itemId);
            fs.writeFileSync(QUEUE_FILE, JSON.stringify(filteredQueue, null, 2));
            return true;
        } catch (error) {
            console.error('Error deleting queue item:', error);
            throw error;
        }
    }
}

module.exports = DatabaseManager;

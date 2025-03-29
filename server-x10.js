// @ts-check
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Type definitions
/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string} sellhubId
 */

// Configuration
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || 'localhost';
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Initialize Express
/** @type {import('express').Express} */
const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());

// Product storage
/** @type {Product[]} */
let products = [];

// Load products with error handling
function loadProducts() {
    try {
        if (fs.existsSync(PRODUCTS_FILE)) {
            const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
            products = JSON.parse(data);
        } else {
            fs.writeFileSync(PRODUCTS_FILE, '[]', { mode: 0o644 });
        }
    } catch (err) {
        console.error('Product load error:', err);
    }
}

// Save products with error handling
function saveProducts() {
    try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), { mode: 0o644 });
        return true;
    } catch (err) {
        console.error('Product save error:', err);
        return false;
    }
}

// Initial load
loadProducts();

// Routes
app.post('/admin/products', (req, res) => {
    try {
        /** @type {Product} */
        const product = {
            id: Date.now().toString(),
            name: String(req.body.name),
            price: parseFloat(req.body.price),
            sellhubId: String(req.body.sellhubId)
        };

        products.push(product);
        
        if (!saveProducts()) {
            throw new Error('Failed to save products');
        }

        return res.json({ success: true, product });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Start server
const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});
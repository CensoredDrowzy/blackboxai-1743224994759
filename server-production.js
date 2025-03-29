// @ts-check
/**
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {import('express').Response} ExpressResponse
 * @typedef {import('express').Application} ExpressApplication
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Initialize Express
const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());

// Product storage with proper error handling
let products = [];

function loadProducts() {
    try {
        if (fs.existsSync(PRODUCTS_FILE)) {
            products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        } else {
            fs.writeFileSync(PRODUCTS_FILE, '[]', { mode: 0o644 });
        }
    } catch (err) {
        console.error('Error loading products:', err);
    }
}

function saveProducts() {
    try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), { mode: 0o644 });
        return true;
    } catch (err) {
        console.error('Error saving products:', err);
        return false;
    }
}

// Load initial products
loadProducts();

// Routes
app.post('/admin/products', (req, res) => {
    try {
        const product = {
            ...req.body,
            id: Date.now().toString(),
            price: parseFloat(req.body.price)
        };
        products.push(product);
        
        if (!saveProducts()) {
            return res.status(500).json({ success: false, error: 'Failed to save product' });
        }
        
        return res.json({ success: true, product });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// [Include other routes...]

// Start server
const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});

process.on('SIGTERM', () => {
    server.close(() => console.log('Server stopped'));
});
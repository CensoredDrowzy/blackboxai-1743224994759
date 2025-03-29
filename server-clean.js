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
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || 'localhost';
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Create Express app
/** @type {ExpressApplication} */
const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(bodyParser.json());

// Product storage
/** @type {Array<{id: string, name: string, price: number, sellhubId: string}>} */
let products = [];

// File operations
function loadProducts() {
    try {
        if (fs.existsSync(PRODUCTS_FILE)) {
            products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        } else {
            fs.writeFileSync(PRODUCTS_FILE, '[]', { mode: 0o644 });
        }
    } catch (err) {
        console.error('Failed to load products:', err);
    }
}

function saveProducts() {
    try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), { mode: 0o644 });
        return true;
    } catch (err) {
        console.error('Failed to save products:', err);
        return false;
    }
}

// Initialize products
loadProducts();

// Routes
app.post('/admin/products', 
    /** @param {ExpressRequest} req @param {ExpressResponse} res */
    (req, res) => {
        try {
            const product = {
                id: Date.now().toString(),
                name: String(req.body.name),
                price: parseFloat(req.body.price),
                sellhubId: String(req.body.sellhubId)
            };

            products.push(product);
            
            if (!saveProducts()) {
                throw new Error('Failed to persist product');
            }

            return res.json({ success: true, product });
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
);

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
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const HOST = 'localhost';
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());

// Product storage
let products = [];

// Load products
function loadProducts() {
    try {
        if (fs.existsSync(PRODUCTS_FILE)) {
            products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        }
    } catch (err) {
        console.error('Error loading products:', err);
    }
}

// Save products
function saveProducts() {
    try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        return true;
    } catch (err) {
        console.error('Error saving products:', err);
        return false;
    }
}

// Initialize
loadProducts();

// Fixed API endpoint
app.post('/admin/products', (req, res) => {
    try {
        const product = {
            id: Date.now().toString(),
            name: String(req.body.name),
            price: parseFloat(req.body.price),
            sellhubId: String(req.body.sellhubId)
        };

        products.push(product);
        
        if (!saveProducts()) {
            throw new Error('Failed to save product');
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
    console.log(`API server running on http://${HOST}:${PORT}`);
});
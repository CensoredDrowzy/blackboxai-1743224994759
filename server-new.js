// @ts-check
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const config = require('./server-config');

const app = express();

// Enhanced CORS configuration
app.use(cors({
    origin: 'http://localhost:8000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(express.static('.'));

// Connection management middleware
app.use((req, res, next) => {
    res.set('Connection', 'close');
    next();
});

// Product database
let products = require('./products.json');

// Admin routes
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if(username === 'admin' && password === 'admin123') {
        res.json({ success: true, token: 'secure-token' });
    } else {
        res.status(401).json({ success: false });
    }
});

app.post('/admin/products', (req, res) => {
    try {
        const product = req.body;
        product.id = Date.now().toString();
        products.push(product);
        require('fs').writeFileSync('./products.json', JSON.stringify(products));
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/admin/products', (req, res) => {
    res.json(products);
});

const server = app.listen(config.port, config.host, () => {
    console.log(`Admin server running on http://${config.host}:${config.port}`);
    server.keepAliveTimeout = config.keepAliveTimeout;
    server.headersTimeout = config.headersTimeout * 1.1; // 10% higher than keepAliveTimeout
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server gracefully terminated');
    });
});// Product database
let products = require('./products.json');

// Admin routes
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if(username === 'admin' && password === 'admin123') {
        res.json({ success: true, token: 'secure-token' });
    } else {
        res.status(401).json({ success: false });
    }
});

// Enhanced product addition endpoint
app.post('/admin/products', (req, res) => {
    try {
        const product = req.body;
        
        // Validate required fields
        if (!product.name || !product.price || !product.sellhubId) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Generate ID and add timestamp
        product.id = Date.now().toString();
        product.createdAt = new Date().toISOString();
        
        // Add to products array
        products.push(product);
        
        // Save to file
        require('fs').writeFileSync('./products.json', JSON.stringify(products, null, 2));
        
        // Return success with product data
        res.json({ 
            success: true,
            product: product
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error'
        });
    }
});

app.get('/admin/products', (req, res) => {
    res.json(products);
});

});

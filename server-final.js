// @ts-check
/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').Application} Application
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const config = require('./server-config');

/** @type {import('express').Express} */
const app = express();

// CORS Configuration
app.use(cors({
    origin: 'http://localhost:8000',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(express.static('.'));

// Product database
/** @type {Array<{id: string, name: string, price: number, sellhubId: string}>} */
let products = [];
const productsPath = path.join(__dirname, 'products.json');

try {
    if (fs.existsSync(productsPath)) {
        products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    }
} catch (err) {
    console.error('Error loading products:', err);
    // Create empty file if doesn't exist
    if (err.code === 'ENOENT') {
        fs.writeFileSync(productsPath, '[]', { mode: 0o644 });
    }
}

// Routes
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, token: 'secure-token' });
    } else {
        res.status(401).json({ success: false });
    }
});

app.post('/admin/products', (req, res) => {
    try {
        const product = {
            ...req.body,
            id: Date.now().toString(),
            price: parseFloat(req.body.price)
        };
        products.push(product);
        try {
            fs.accessSync(productsPath, fs.constants.W_OK);
            fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), { mode: 0o644 });
        } catch (err) {
            console.error('Error writing products:', err);
            return res.status(500).json({ 
                success: false, 
                error: 'Could not save product - check file permissions'
            });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/admin/products', (req, res) => {
    res.json(products);
});

// Server configuration
const server = app.listen(config.port, config.host, () => {
    console.log(`Server running on http://${config.host}:${config.port}`);
    server.keepAliveTimeout = config.keepAliveTimeout;
    server.headersTimeout = config.headersTimeout * 1.1;
});

process.on('SIGTERM', () => {
    server.close(() => console.log('Server stopped'));
});
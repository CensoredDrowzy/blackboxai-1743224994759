const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./server-config');
const app = express();
const PORT = config.port;

// Enable CORS
app.use(cors({
    origin: 'http://localhost:8000',
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.static('.'));

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

// Start server
const server = app.listen(PORT, 'localhost', () => {
    console.log(`Admin server running on port ${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    } else {
        console.error('Server error:', error);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

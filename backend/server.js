const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // 1. Import HTTP
const { Server } = require('socket.io'); // 2. Import Socket.io
require('dotenv').config();

// === 1. IMPORT ALL ROUTES ===
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes'); 
const addressRoutes = require('./routes/addressRoutes'); 
const wishlistRoutes = require('./routes/wishlistRoutes'); 
const adminRoutes = require('./routes/adminRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes'); 
const filterRoutes = require('./routes/filterRoutes');
const authRoutes = require('./routes/authRoutes'); // <--- Use this for Unified Login

const app = express();

// === 3. SETUP SOCKET.IO SERVER ===
const server = http.createServer(app); // Wrap Express app
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Frontend URL (Vite Default)
    methods: ["GET", "POST"]
  }
});

// Middleware to pass 'io' to all routes
app.use((req, res, next) => {
  req.io = io; // Now you can use req.io.emit() in any route!
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// === 2. USE ROUTES ===
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api/addresses', addressRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/categories', categoryRoutes); 
app.use('/api/filters', filterRoutes);

// === FIX: Use authRoutes for Unified Login (Checks both Admin & User collections) ===
app.use('/api/users', authRoutes); 

// Test Route
app.get('/', (req, res) => {
  res.send('ShopSync Backend is Running!');
});

// === 3. DATABASE CONNECTION & SERVER START ===
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
    // Use 'server.listen' instead of 'app.listen' for WebSockets
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
  });
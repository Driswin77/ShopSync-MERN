const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Needed for ObjectId
const User = require('../models/User');
const Admin = require('../models/Admin'); // FIX: Import the Admin model
const Order = require('../models/Order');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ======================================================
// === MIDDLEWARE TO PROTECT ADMIN ROUTES ===
// ======================================================
const protectAdmin = async (req, res, next) => {
    let token = req.headers.authorization;
    
    // Check for Bearer token
    if (token && token.startsWith('Bearer')) {
      try {
        // Verify Token - FIX: Pulling from process.env.JWT_SECRET
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        
        // Check Admin Privileges from token payload
        if (decoded.isAdmin) {
            // === FIX: Verify Admin exists in the dedicated ADMIN collection ===
            req.user = await Admin.findById(decoded.id).select('-password'); 
            
            if (!req.user) {
                return res.status(401).json({ message: 'Admin account not found in database' });
            }
            next();
        } else {
            res.status(401).json({ message: 'Not authorized as admin' });
        }
      } catch (error) { 
          res.status(401).json({ message: 'Token failed or expired' }); 
      }
    } else { 
        res.status(401).json({ message: 'No token provided' }); 
    }
};

// ======================================================
// === 1. ADMIN LOGIN ROUTE (VERIFIED AGAINST ADMINS) ===
// ======================================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // === FIX: Query the Admin collection instead of User ===
    const adminUser = await Admin.findOne({ email });

    if (!adminUser) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Return unified response structure
    res.json({
      _id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      token: jwt.sign(
          { id: adminUser._id, isAdmin: true }, 
          process.env.JWT_SECRET, 
          { expiresIn: '30d' }
      ),
      isAdmin: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ======================================================
// === 2. DASHBOARD STATS ROUTE (FULL DATA) ===
// ======================================================
router.get('/stats', protectAdmin, async (req, res) => {
    try {
      // 1. Basic Counters (FILTERED: Excludes Cancelled Orders)
      const totalUsers = await User.countDocuments();
      const totalOrders = await Order.countDocuments({ status: { $ne: 'Cancelled' } });
      const totalProducts = await Product.countDocuments(); 
      
      // 2. Total Revenue (FILTERED: Excludes Cancelled Orders)
      const orders = await Order.find({ status: { $ne: 'Cancelled' } });
      const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  
      // 3. Today's Orders (FILTERED: Excludes Cancelled)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ordersToday = await Order.countDocuments({ 
          createdAt: { $gte: today },
          status: { $ne: 'Cancelled' } 
      });

      // 4. Recent Orders (Detailed List - we keep cancelled visible but marked)
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name') 
        .lean();

      // 5. Top Selling Products (FILTERED: Excludes Cancelled quantities)
      const topProducts = await Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $unwind: "$orderItems" },
        { 
            $group: { 
                _id: "$orderItems.name", 
                count: { $sum: "$orderItems.quantity" } 
            } 
        },
        { $sort: { count: -1 } },
        { $limit: 5 } 
      ]);

      // 6. Best Selling Category (FILTERED: Excludes Cancelled)
      const topCategories = await Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $unwind: "$orderItems" },
        { $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "productInfo" } },
        { $unwind: "$productInfo" },
        { $group: { _id: "$productInfo.category", count: { $sum: "$orderItems.quantity" } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);

      // Return Data
      res.json({ 
          users: totalUsers, 
          orders: totalOrders, 
          products: totalProducts, 
          revenue: totalRevenue,
          ordersToday: ordersToday, 
          recentOrders: recentOrders, 
          topProducts: topProducts,
          bestCategory: topCategories[0] || { _id: "N/A", count: 0 } 
      });

    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// ======================================================
// === 3. SINGLE PRODUCT SALES HISTORY (7 DAYS) ===
// ======================================================
router.get('/product-stats/:id', protectAdmin, async (req, res) => {
    try {
        const productId = new mongoose.Types.ObjectId(req.params.id);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesHistory = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'Cancelled' } } }, 
            { $unwind: "$orderItems" },
            { $match: { "orderItems.product": productId } }, 
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: "$orderItems.quantity" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(salesHistory);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ======================================================
// === 4. DYNAMIC CREATE ADMIN ROUTE (ADMIN COLLECTION) ===
// ======================================================
router.post('/create-admin', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin account already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = await Admin.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'Admin Created Successfully', adminId: newAdmin._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ======================================================
// === 5. USER MANAGEMENT ROUTES (FOR CUSTOMER LIST) ===
// ======================================================

// GET ALL CUSTOMERS
router.get('/users', protectAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); 
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE CUSTOMER
router.delete('/users/:id', protectAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.findByIdAndDelete(req.params.id);
            res.json({ message: 'Customer account removed' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE USER
router.put('/users/:id', protectAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            const updatedUser = await user.save();
            res.json({ 
                _id: updatedUser._id, 
                name: updatedUser.name, 
                email: updatedUser.email 
            });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// MANAGE USER STATUS (Block/Unblock/Deactivate)
router.put('/users/:id/status', protectAdmin, async (req, res) => {
    const { action } = req.body; // 'block', 'unblock', 'deactivate'

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (action === 'block') {
            user.isBlocked = true;
            user.deactivatedUntil = null; // Clear deactivation if blocking
        } else if (action === 'unblock') {
            user.isBlocked = false;
        } else if (action === 'deactivate') {
            // Set time to 5 minutes from now
            user.deactivatedUntil = new Date(Date.now() + 5 * 60000);
            user.isBlocked = false; 
        }

        await user.save();
        res.json({ message: `User status updated to ${action}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
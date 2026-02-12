const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User'); // <--- 1. IMPORT USER MODEL
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith('Bearer')) {
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      req.user = { _id: decoded.id };
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    res.status(401).json({ message: 'No token' });
  }
};

// 1. CREATE NEW ORDER (With Deactivation Check)
router.post('/', protect, async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

  try {
    // === 2. CHECK IF USER IS DEACTIVATED ===
    // We must fetch the full user to check the 'deactivatedUntil' timestamp
    const user = await User.findById(req.user._id);

    if (user.deactivatedUntil && new Date() < new Date(user.deactivatedUntil)) {
        const minutesLeft = Math.ceil((new Date(user.deactivatedUntil) - new Date()) / 60000);
        return res.status(403).json({ 
            message: `Account temporarily deactivated. You can make purchases again in ${minutesLeft} minutes.` 
        });
    }
    // =======================================

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    } else {
      const order = new Order({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice,
        status: 'Processing',
        isPaid: true, 
        paidAt: Date.now(),
      });

      const createdOrder = await order.save();

      // === REAL-TIME NOTIFICATION TRIGGER ===
      if (req.io) {
          req.io.emit('new-order', createdOrder);
      }
      // ======================================

      res.status(201).json(createdOrder);
    }
  } catch (error) {
      res.status(500).json({ message: "Server Error: " + error.message });
  }
});

// 2. GET LOGGED IN USER ORDERS
router.get('/myorders', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// ======================================================
// === CANCEL ORDER ROUTE (PUT) ===
// ======================================================
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.status === 'Shipped' || order.status === 'Delivered') {
          return res.status(400).json({ message: 'Cannot cancel order that has been shipped or delivered' });
      }

      order.status = 'Cancelled';
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
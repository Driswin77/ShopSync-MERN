const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin'); 

// ==========================================
// 1. REGISTER ROUTE (Create New Customer)
// ==========================================
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists in User OR Admin collection
    const userExists = await User.findOne({ email });
    const adminExists = await Admin.findOne({ email });

    if (userExists || adminExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User (Always creates a regular User, not Admin)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: false 
    });

    if (user) {
      // === REAL-TIME NOTIFICATION TRIGGER ===
      // Broadcast to Admin Dashboard that a new user joined
      // This updates the "Total Users" count and the Table instantly
      if (req.io) {
          req.io.emit('new-user', {
              _id: user._id,
              name: user.name,
              email: user.email,
              isAdmin: user.isAdmin,
              createdAt: user.createdAt,
              isBlocked: false,       // Default state for new user
              deactivatedUntil: null  // Default state for new user
          });
      }
      // ======================================

      // Generate Token immediately so they are logged in
      const token = jwt.sign(
        { id: user._id, isAdmin: false }, 
        process.env.JWT_SECRET || 'secret123', 
        { expiresIn: '30d' }
      );

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 2. LOGIN ROUTE (Unified: Checks Admin & User)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // A. Check Admin Collection First
    let account = await Admin.findOne({ email });
    let isSystemAdmin = true;

    // B. If not found in Admin, check User Collection
    if (!account) {
      account = await User.findOne({ email });
      isSystemAdmin = false;
    }

    // C. If account not found in either
    if (!account) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // D. Block Check (Only for regular Users)
    if (!isSystemAdmin && account.isBlocked) {
        return res.status(403).json({ message: 'Your account has been blocked. Contact Admin.' });
    }

    // E. Check Password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // F. Generate Token
    const token = jwt.sign(
      { id: account._id, isAdmin: isSystemAdmin }, 
      process.env.JWT_SECRET || 'secret123', 
      { expiresIn: "30d" }
    );

    // G. Send Response
    res.json({ 
      token, 
      _id: account._id, 
      name: account.name, 
      email: account.email,
      isAdmin: isSystemAdmin 
    });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
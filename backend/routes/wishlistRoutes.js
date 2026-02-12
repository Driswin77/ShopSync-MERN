const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const jwt = require('jsonwebtoken');

// Middleware
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

// 1. GET MY WISHLIST
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    
    if (!wishlist) {
      // Create empty wishlist if none exists
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    
    res.json(wishlist.products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. ADD TO WISHLIST
router.post('/add', protect, async (req, res) => {
  const { productId } = req.body;
  
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [productId] });
    } else {
      // Check if product already exists
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
      }
    }

    await wishlist.save();
    res.status(200).json({ message: 'Product added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. REMOVE FROM WISHLIST
router.delete('/:id', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (prodId) => prodId.toString() !== req.params.id
      );
      await wishlist.save();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Wishlist not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const jwt = require('jsonwebtoken'); 

// === MIDDLEWARE: PROTECT ADMIN ROUTES ===
const protectAdmin = async (req, res, next) => {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer')) {
      try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secret123');
        // Check if the token has the isAdmin flag
        if (decoded.isAdmin) {
            // === Manually set req.user so the route can read req.user._id ===
            req.user = { _id: decoded.id }; 
            next();
        } else {
            res.status(401).json({ message: 'Not authorized as admin' });
        }
      } catch (error) {
        res.status(401).json({ message: 'Token failed' });
      }
    } else {
      res.status(401).json({ message: 'No token' });
    }
};

// 1. GET ALL PRODUCTS (Updated with SEARCH Logic)
router.get('/', async (req, res) => {
  try {
    // A. SEARCH LOGIC
    const keyword = req.query.search
      ? {
          title: {
            $regex: req.query.search,
            $options: 'i',
          },
        }
      : {};

    // B. CATEGORY LOGIC
    const category = req.query.category && req.query.category !== 'all' 
      ? { category: req.query.category } 
      : {};

    // C. FIND PRODUCTS
    const products = await Product.find({ ...keyword, ...category });
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET SINGLE PRODUCT
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Fetch reviews from separate collection
    const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 });

    res.json({ ...product._doc, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. CREATE REVIEW (Updated to support IMAGES)
router.post('/:id/reviews', async (req, res) => {
  // === EXTRACT IMAGE HERE ===
  const { rating, comment, name, image } = req.body; 

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // 1. SAVE REVIEW WITH IMAGE
    const newReview = new Review({
      productId: product._id,
      userName: name || "Anonymous",
      rating: Number(rating),
      comment: comment,
      image: image // <--- Saving the Base64 image string to DB
    });
    await newReview.save();

    // 2. CALCULATE STATS
    const allReviews = await Review.find({ productId: product._id });
    
    const count = allReviews.length;
    const avgRating = count > 0 
        ? allReviews.reduce((acc, item) => item.rating + acc, 0) / count 
        : 0;

    // 3. UPDATE PRODUCT & FIX MISSING DATA
    if (!product.description) product.description = "No description available";
    if (!product.category) product.category = "Uncategorized";
    if (!product.title) product.title = "Untitled Product";
    if (!product.image) product.image = "https://via.placeholder.com/150";
    if (!product.price) product.price = 0;

    product.rating = Number(avgRating.toFixed(1)); 
    product.numReviews = count;
    
    await product.save();

    res.status(201).json({ message: 'Review Saved Successfully' });

  } catch (err) {
    console.error("Backend Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ======================================================
// === 4. ADMIN ROUTES (DELETE, CREATE, UPDATE) ===
// ======================================================

// DELETE PRODUCT (Admin Only)
router.delete('/:id', protectAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await Product.findByIdAndDelete(req.params.id);
            res.json({ message: 'Product Removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// CREATE PRODUCT (Admin Only)
router.post('/', protectAdmin, async (req, res) => {
    try {
        const { title, price, image, brand, category, countInStock, description } = req.body;
        
        const product = new Product({
            title,
            price,
            user: req.user._id,
            image,
            brand,
            category,
            countInStock: countInStock || 0,
            numReviews: 0,
            description
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (err) {
        res.status(400).json({ message: 'Invalid Data: ' + err.message });
    }
});

// === NEW: UPDATE PRODUCT (Admin Only - Required for Edit Feature) ===
router.put('/:id', protectAdmin, async (req, res) => {
    const { title, price, description, image, brand, category, countInStock } = req.body;
  
    try {
      const product = await Product.findById(req.params.id);
  
      if (product) {
        product.title = title || product.title;
        product.price = price || product.price;
        product.description = description || product.description;
        product.image = image || product.image;
        product.brand = brand || product.brand;
        product.category = category || product.category;
        product.countInStock = countInStock || product.countInStock;
  
        const updatedProduct = await product.save();
        res.json(updatedProduct);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (err) {
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

module.exports = router;
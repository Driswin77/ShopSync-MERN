const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET ALL CATEGORIES
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADD CATEGORY (Admin)
router.post('/', async (req, res) => {
    try {
        const { name, icon } = req.body;
        // Normalize name to lowercase for consistency if desired
        const category = new Category({ name: name.toLowerCase(), icon });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: 'Category already exists or invalid data' });
    }
});

module.exports = router;
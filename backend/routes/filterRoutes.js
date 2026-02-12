const express = require('express');
const router = express.Router();
const Filter = require('../models/Filter');

// GET FILTERS BY CATEGORY
router.get('/:category', async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    
    // Find filters for this specific category
    let filterConfig = await Filter.findOne({ category });

    // If no specific config exists, return a default/generic set
    if (!filterConfig) {
        filterConfig = await Filter.findOne({ category: 'default' });
    }

    // If still nothing, return empty structure to prevent crash
    if (!filterConfig) {
        return res.json([]); 
    }

    res.json(filterConfig.filters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - CREATE/UPDATE FILTERS (For Admin Use or Seed Data)
router.post('/', async (req, res) => {
    const { category, filters } = req.body;
    try {
        let filter = await Filter.findOne({ category });
        if (filter) {
            filter.filters = filters;
            await filter.save();
        } else {
            filter = new Filter({ category, filters });
            await filter.save();
        }
        res.json(filter);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
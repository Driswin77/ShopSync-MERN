const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
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

// 1. GET ALL ADDRESSES
router.get('/', protect, async (req, res) => {
  const addresses = await Address.find({ user: req.user._id });
  res.json(addresses);
});

// 2. ADD NEW ADDRESS
router.post('/', protect, async (req, res) => {
  const { name, phone, address, city, state, pincode, landmark, type, isDefault } = req.body;

  // If this is set as default, unset previous default
  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const newAddress = new Address({
    user: req.user._id,
    name, phone, address, city, state, pincode, landmark, type, isDefault
  });

  const savedAddress = await newAddress.save();
  res.status(201).json(savedAddress);
});

// 3. UPDATE ADDRESS
router.put('/:id', protect, async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (address && address.user.toString() === req.user._id.toString()) {
    // Check default logic
    if (req.body.isDefault) {
       await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    address.name = req.body.name || address.name;
    address.phone = req.body.phone || address.phone;
    address.address = req.body.address || address.address;
    address.city = req.body.city || address.city;
    address.state = req.body.state || address.state;
    address.pincode = req.body.pincode || address.pincode;
    address.landmark = req.body.landmark || address.landmark;
    address.type = req.body.type || address.type;
    address.isDefault = req.body.isDefault !== undefined ? req.body.isDefault : address.isDefault;

    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } else {
    res.status(404).json({ message: 'Address not found' });
  }
});

// 4. DELETE ADDRESS
router.delete('/:id', protect, async (req, res) => {
  const address = await Address.findById(req.params.id);
  if (address && address.user.toString() === req.user._id.toString()) {
    await address.deleteOne();
    res.json({ message: 'Address removed' });
  } else {
    res.status(404).json({ message: 'Address not found' });
  }
});

module.exports = router;
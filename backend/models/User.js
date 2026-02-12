const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    
    // === EXISTING PROFILE FIELDS ===
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    gender: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' }, 

    // === NEW ACCOUNT STATUS FIELDS (For Admin Control) ===
    isBlocked: { type: Boolean, default: false }, // Prevents Login
    deactivatedUntil: { type: Date, default: null } // Prevents Purchasing until this time
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
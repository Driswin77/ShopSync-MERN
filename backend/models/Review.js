// backend/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    userName: { type: String, required: true }, 
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    
    // === ADDED IMAGE FIELD ===
    image: { type: String, required: false }, // Stores the Base64 string
    
    userToken: { type: String } // Optional: to track who posted it
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
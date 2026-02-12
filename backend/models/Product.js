const mongoose = require('mongoose');

// 1. Define Review Schema
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    // === NEW FIELD FOR REVIEW IMAGE ===
    image: { type: String, required: false }, // Stores the Base64 string
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true }
);

// 2. Define Product Schema
const productSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true }, // Main product image
    
    // Embed the Review Schema
    reviews: [reviewSchema], 
    
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    
    // Optional: Add specific attributes for filtering if needed
    brand: { type: String },
    color: { type: String },
    countInStock: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
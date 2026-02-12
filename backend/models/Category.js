const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    icon: { type: String, default: '' } // Optional: URL for the category icon
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
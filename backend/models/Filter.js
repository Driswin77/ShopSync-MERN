const mongoose = require('mongoose');

const filterSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true }, 
  filters: [
    {
      title: { type: String, required: true },
      options: [{ type: String }] 
    }
  ]
});

module.exports = mongoose.model('Filter', filterSchema);
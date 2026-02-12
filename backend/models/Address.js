const mongoose = require('mongoose');

const addressSchema = mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }, // Street/House No
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String },
    type: { type: String, default: 'home' }, // 'home' or 'work'
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Address', addressSchema);
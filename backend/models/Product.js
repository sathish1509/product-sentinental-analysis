const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  product_id: { type: String, required: true, unique: true, index: true },
  product_name: { type: String, required: true },
  category: { type: String, required: true, index: true },
  average_rating: { type: Number, default: 0 },
  total_reviews: { type: Number, default: 0 },
  description: { type: String },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);

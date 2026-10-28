const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  product_id: { type: String, required: true, index: true },
  product_name: { type: String },
  category: { type: String },
  review_title: { type: String, required: true },
  review_text: { type: String, required: true },
  rating: { type: Number, required: true },
  review_date: { type: String },
  verified_purchase: { type: Boolean, default: true },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], required: true },
  confidence: { type: Number, default: 0.85 },
  source: { type: String, enum: ['live_api', 'mongodb_cache', 'offline_dataset'], required: true },
  aspects: [{ type: String }],
  created_at: { type: Date, default: Date.now }
});

ReviewSchema.index({ product_id: 1, review_text: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);

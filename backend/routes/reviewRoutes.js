const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  analyzeReviewText,
  getRainforestReviewsHandler
} = require('../controllers/reviewController');

// Rainforest API direct endpoint
router.get('/rainforest', getRainforestReviewsHandler);
router.get('/rainforest/:asin', getRainforestReviewsHandler);

// Pipeline reviews endpoints
router.get('/products/:id/reviews', getProductReviews);
router.get('/:id', getProductReviews);
router.post('/analyze', analyzeReviewText);

module.exports = router;

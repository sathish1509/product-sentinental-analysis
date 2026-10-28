const express = require('express');
const router = express.Router();
const {
  getProductAnalytics,
  getGlobalAnalytics,
  getModelEvaluation,
  getBrandIntelligence,
  compareProducts
} = require('../controllers/analyticsController');

router.get('/global', getGlobalAnalytics);
router.get('/overview', getGlobalAnalytics);
router.get('/model-evaluation', getModelEvaluation);
router.get('/brand-intelligence', getBrandIntelligence);
router.get('/compare', compareProducts);
router.get('/products/:id/analytics', getProductAnalytics);

module.exports = router;

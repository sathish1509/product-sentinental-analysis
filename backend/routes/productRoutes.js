const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  updateApiSimulationMode,
  getApiSimulationMode
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/simulation-mode', getApiSimulationMode);
router.post('/simulation-mode', updateApiSimulationMode);
router.get('/:id', getProductById);

module.exports = router;

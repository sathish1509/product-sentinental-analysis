const express = require('express');
const router = express.Router();
const { uploadAndProcessCSV } = require('../controllers/ingestionController');

// Support both raw text/csv and JSON with csvText
router.post('/upload-csv', express.text({ type: ['text/csv', 'text/plain'], limit: '20mb' }), uploadAndProcessCSV);

module.exports = router;

const { getProductReviewsWithFallback } = require('../services/reviewService');
const { predictSentiment } = require('../services/sentimentInferenceService');
const { fetchRainforestReviews } = require('../services/rainforestService');

const getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getProductReviewsWithFallback(id);
    res.json({
      success: true,
      product_id: id,
      source: result.source,
      message: result.message,
      count: result.reviews.length,
      reviews: result.reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      source: 'offline_dataset',
      message: 'Failed to retrieve live/cache reviews. System operating in error boundary mode.',
      error: error.message,
      reviews: []
    });
  }
};

const analyzeReviewText = async (req, res) => {
  try {
    const { text, rating } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Review text is required for analysis.' });
    }

    const prediction = await predictSentiment(text, rating ? parseInt(rating) : null);
    res.json({
      success: true,
      text: text,
      rating: rating || null,
      sentiment: prediction.sentiment,
      confidence: prediction.confidence,
      aspects: prediction.aspects || []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getRainforestReviewsHandler = async (req, res) => {
  try {
    const asin = req.query.asin || req.params.asin;
    const amazon_domain = req.query.amazon_domain || 'amazon.in';
    const language = req.query.language || 'en';
    const output = req.query.output || 'json';

    const result = await fetchRainforestReviews({
      asin,
      amazon_domain,
      language,
      output
    });

    if (!result.success) {
      const status = result.statusCode || (result.error.includes('required') || result.error.includes('configured') ? 400 : 500);
      return res.status(status).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error while querying Rainforest API'
    });
  }
};

module.exports = {
  getProductReviews,
  analyzeReviewText,
  getRainforestReviewsHandler
};

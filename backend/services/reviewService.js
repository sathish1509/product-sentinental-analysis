const fs = require('fs');
const path = require('path');
const Review = require('../models/Review');
const { getDBStatus } = require('../config/db');
const { fetchExternalReviews } = require('./externalReviewApi');
const { predictSentiment } = require('./sentimentInferenceService');

// Helper to load local fallback dataset from data/raw/
const getOfflineDatasetReviews = async (productId) => {
  const jsonPath = path.join(__dirname, '..', '..', 'data', 'raw', 'sample_reviews.json');
  const csvPath = path.join(__dirname, '..', '..', 'data', 'raw', 'product_reviews.csv');

  let rawReviews = [];

  if (fs.existsSync(jsonPath)) {
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    rawReviews = JSON.parse(fileContent);
  }

  let filtered = rawReviews.filter(r => r.product_id === productId);

  if (filtered.length === 0 && rawReviews.length > 0) {
    // If exact product not found in JSON, return sample slice
    filtered = rawReviews.slice(0, 4);
  }

  // Enrich with live sentiment classification and source tag
  const enriched = await Promise.all(
    filtered.map(async (r) => {
      const text = `${r.review_title || ''} ${r.review_text || ''}`;
      const sentimentResult = await predictSentiment(text, r.rating);
      return {
        product_id: productId,
        product_name: r.product_name || `Product ${productId}`,
        category: r.category || 'General',
        review_title: r.review_title || 'Customer Review',
        review_text: r.review_text || '',
        rating: r.rating || 4,
        review_date: r.review_date || new Date().toISOString().split('T')[0],
        verified_purchase: r.verified_purchase !== undefined ? r.verified_purchase : true,
        sentiment: sentimentResult.sentiment,
        confidence: sentimentResult.confidence,
        aspects: sentimentResult.aspects || [],
        source: 'offline_dataset'
      };
    })
  );

  return enriched;
};

const getProductReviewsWithFallback = async (productId) => {
  let apiError = null;

  // ----------------------------------------------------
  // TIER 1: Try External Live Review API
  // ----------------------------------------------------
  try {
    const liveReviews = await fetchExternalReviews(productId);
    if (liveReviews && liveReviews.length > 0) {
      // Process and classify live API reviews
      const processedReviews = await Promise.all(
        liveReviews.map(async (r) => {
          const fullText = `${r.review_title || ''} ${r.review_text || ''}`;
          const inference = await predictSentiment(fullText, r.rating);

          const reviewObj = {
            product_id: productId,
            product_name: r.product_name || `Product ${productId}`,
            category: r.category || 'Electronics',
            review_title: r.review_title,
            review_text: r.review_text,
            rating: r.rating,
            review_date: r.review_date || new Date().toISOString().split('T')[0],
            verified_purchase: r.verified_purchase !== undefined ? r.verified_purchase : true,
            sentiment: inference.sentiment,
            confidence: inference.confidence,
            aspects: inference.aspects || [],
            source: 'live_api'
          };

          // Cache in MongoDB if database is available
          if (getDBStatus()) {
            try {
              await Review.findOneAndUpdate(
                { product_id: productId, review_text: r.review_text },
                reviewObj,
                { upsert: true, new: true }
              );
            } catch (dbErr) {
              console.warn('[!] Could not save live review to MongoDB cache:', dbErr.message);
            }
          }

          return reviewObj;
        })
      );

      return {
        source: 'live_api',
        message: 'Successfully retrieved live product reviews from external API.',
        reviews: processedReviews
      };
    }
  } catch (err) {
    apiError = err.message;
    console.warn(`[!] Tier 1 (Live API) failed: ${apiError}. Falling back to Tier 2 (MongoDB Cache)...`);
  }

  // ----------------------------------------------------
  // TIER 2: MongoDB Cache Fallback
  // ----------------------------------------------------
  if (getDBStatus()) {
    try {
      const cachedReviews = await Review.find({ product_id: productId }).lean();
      if (cachedReviews && cachedReviews.length > 0) {
        const reviewsWithSource = cachedReviews.map(r => ({
          ...r,
          source: 'mongodb_cache'
        }));

        return {
          source: 'mongodb_cache',
          message: `Live API unavailable (${apiError}). Serving cached reviews from MongoDB.`,
          reviews: reviewsWithSource
        };
      }
    } catch (cacheErr) {
      console.warn(`[!] Tier 2 (MongoDB Cache) lookup failed: ${cacheErr.message}. Falling back to Tier 3 (Offline Dataset)...`);
    }
  }

  // ----------------------------------------------------
  // TIER 3: Local Offline Dataset Fallback
  // ----------------------------------------------------
  const offlineReviews = await getOfflineDatasetReviews(productId);
  return {
    source: 'offline_dataset',
    message: `Live API and MongoDB cache unavailable. Serving fallback reviews from local offline dataset.`,
    reviews: offlineReviews
  };
};

module.exports = { getProductReviewsWithFallback };

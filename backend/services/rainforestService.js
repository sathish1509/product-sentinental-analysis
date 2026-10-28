const RAINFOREST_BASE_URL = 'https://api.rainforestapi.com/request';

/**
 * Sanitizes strings to strip out any inadvertent exposure of the API key
 */
const sanitizeErrorMessage = (message, apiKey) => {
  if (!message) return 'An unexpected Rainforest API error occurred.';
  if (apiKey && message.includes(apiKey)) {
    return message.replace(new RegExp(apiKey, 'g'), '[REDACTED_API_KEY]');
  }
  return message;
};

/**
 * Normalizes a single raw Rainforest review object into the standard schema
 */
const normalizeRainforestReview = (rev, asin, country = 'India') => {
  return {
    review_id: rev.id || rev.review_id || `REV-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    title: rev.title || '',
    body: rev.body || rev.text || '',
    rating: typeof rev.rating === 'number' ? rev.rating : (parseInt(rev.rating) || 5),
    review_date: rev.date?.utc || rev.date?.raw || rev.review_date || new Date().toISOString().split('T')[0],
    reviewer: {
      name: rev.profile?.name || 'Amazon Customer',
      id: rev.profile?.id || null,
      avatar: rev.profile?.avatar || null
    },
    verified_purchase: rev.verified_purchase !== undefined ? Boolean(rev.verified_purchase) : true,
    helpful_votes: typeof rev.helpful_votes === 'number' ? rev.helpful_votes : (parseInt(rev.helpful_votes) || 0),
    review_country: rev.country || country,
    asin: asin,
    review_link: rev.link || `https://www.amazon.com/gp/customer-reviews/${rev.id || ''}`,
    raw_response: rev
  };
};

/**
 * Fetches and normalizes Amazon product reviews from Rainforest API using native fetch
 */
const fetchRainforestReviews = async ({
  asin,
  amazon_domain = 'amazon.in',
  language = 'en',
  output = 'json'
}) => {
  const apiKey = process.env.RAINFOREST_API_KEY;

  // 1. Error Handling: Missing API Key
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_api_key_here')) {
    return {
      success: false,
      error: 'RAINFOREST_API_KEY is not configured in environment variables (.env).'
    };
  }

  // 2. Error Handling: Missing ASIN
  if (!asin || typeof asin !== 'string' || asin.trim() === '') {
    return {
      success: false,
      error: 'ASIN parameter is required.'
    };
  }

  const cleanAsin = asin.trim();
  const cleanDomain = (amazon_domain || 'amazon.in').trim();

  try {
    const queryParams = new URLSearchParams({
      api_key: apiKey.trim(),
      type: 'reviews',
      amazon_domain: cleanDomain,
      asin: cleanAsin,
      language: language || 'en',
      output: output || 'json'
    });

    const url = `${RAINFOREST_BASE_URL}?${queryParams.toString()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        asin: cleanAsin,
        amazon_domain: cleanDomain,
        statusCode: response.status,
        error: 'Rainforest API authentication failed. Invalid API key.'
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        asin: cleanAsin,
        amazon_domain: cleanDomain,
        statusCode: 429,
        error: 'Rainforest API rate limit or credit quota exceeded (429 Too Many Requests).'
      };
    }

    if (response.status === 400 || response.status === 404) {
      return {
        success: false,
        asin: cleanAsin,
        amazon_domain: cleanDomain,
        statusCode: response.status,
        error: `Invalid ASIN (${cleanAsin}) or Amazon domain (${cleanDomain}).`
      };
    }

    if (!response.ok) {
      return {
        success: false,
        asin: cleanAsin,
        amazon_domain: cleanDomain,
        statusCode: response.status,
        error: `Rainforest API returned HTTP status ${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();

    // Check for Rainforest API error payload
    if (data.request_info && data.request_info.success === false) {
      const apiMsg = data.request_info.message || 'Rainforest API returned unsuccessful status.';
      return {
        success: false,
        asin: cleanAsin,
        amazon_domain: cleanDomain,
        error: sanitizeErrorMessage(apiMsg, apiKey)
      };
    }

    const rawReviews = data.reviews || [];

    // 3. Error Handling: Empty review response
    if (!Array.isArray(rawReviews) || rawReviews.length === 0) {
      return {
        success: true,
        asin: cleanAsin,
        amazon_domain: cleanDomain,
        reviews_count: 0,
        message: 'No reviews found for this ASIN on the specified Amazon domain.',
        reviews: []
      };
    }

    // Determine country display name from domain
    const countryMap = {
      'amazon.in': 'India',
      'amazon.com': 'United States',
      'amazon.co.uk': 'United Kingdom',
      'amazon.de': 'Germany',
      'amazon.ca': 'Canada'
    };
    const reviewCountry = countryMap[cleanDomain.toLowerCase()] || cleanDomain;

    const normalizedReviews = rawReviews.map(rev =>
      normalizeRainforestReview(rev, cleanAsin, reviewCountry)
    );

    return {
      success: true,
      asin: cleanAsin,
      amazon_domain: cleanDomain,
      reviews_count: normalizedReviews.length,
      reviews: normalizedReviews,
      request_info: data.request_info || null
    };

  } catch (error) {
    let errorMessage = 'Failed to fetch reviews from Rainforest API.';

    if (error.name === 'AbortError') {
      errorMessage = 'Rainforest API request timed out after 15000ms.';
    } else {
      errorMessage = error.message;
    }

    return {
      success: false,
      asin: cleanAsin,
      amazon_domain: cleanDomain,
      error: sanitizeErrorMessage(errorMessage, apiKey)
    };
  }
};

module.exports = {
  fetchRainforestReviews,
  normalizeRainforestReview
};

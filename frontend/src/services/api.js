import axios from 'axios';

const API_BASE = '/api';

// In-memory cache store (URL -> { data, timestamp })
const apiCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes TTL

export const clearApiCache = () => {
  apiCache.clear();
};

const getCachedOrFetch = async (url) => {
  const now = Date.now();
  if (apiCache.has(url)) {
    const { data, timestamp } = apiCache.get(url);
    if (now - timestamp < CACHE_TTL_MS) {
      return data;
    }
  }

  const response = await axios.get(url);
  apiCache.set(url, { data: response.data, timestamp: now });
  return response.data;
};

export const fetchProducts = async (forceRefresh = false) => {
  const url = `${API_BASE}/products`;
  if (forceRefresh) apiCache.delete(url);
  return getCachedOrFetch(url);
};

export const fetchProductById = async (productId, forceRefresh = false) => {
  const url = `${API_BASE}/products/${productId}`;
  if (forceRefresh) apiCache.delete(url);
  return getCachedOrFetch(url);
};

export const fetchReviews = async (productId, forceRefresh = false) => {
  const url = `${API_BASE}/reviews/products/${productId}/reviews`;
  if (forceRefresh) apiCache.delete(url);
  return getCachedOrFetch(url);
};

export const fetchProductAnalytics = async (productId, forceRefresh = false) => {
  const url = `${API_BASE}/analytics/products/${productId}/analytics`;
  if (forceRefresh) apiCache.delete(url);
  return getCachedOrFetch(url);
};

export const fetchGlobalAnalytics = async (forceRefresh = false) => {
  const url = `${API_BASE}/analytics/global`;
  if (forceRefresh) apiCache.delete(url);
  return getCachedOrFetch(url);
};

export const fetchModelEvaluation = async (forceRefresh = false) => {
  const url = `${API_BASE}/analytics/model-evaluation`;
  if (forceRefresh) apiCache.delete(url);
  return getCachedOrFetch(url);
};

export const fetchBrandIntelligence = async (forceRefresh = false) => {
  const url = `${API_BASE}/analytics/brand-intelligence`;
  if (forceRefresh) apiCache.delete(url);
  return getCachedOrFetch(url);
};

export const compareProducts = async (productIds = ['PROD-101', 'PROD-102']) => {
  const idsStr = Array.isArray(productIds) ? productIds.join(',') : productIds;
  const response = await axios.get(`${API_BASE}/analytics/compare?ids=${encodeURIComponent(idsStr)}`);
  return response.data;
};

export const uploadCSV = async (csvText, filename = 'uploaded.csv', appendToDataset = false) => {
  const response = await axios.post(`${API_BASE}/ingestion/upload-csv`, {
    csvText,
    filename,
    appendToDataset
  });
  return response.data;
};

export const analyzeReview = async (text, rating = null) => {
  const response = await axios.post(`${API_BASE}/reviews/analyze`, { text, rating });
  return response.data;
};

export const updateSimulationMode = async (mode) => {
  const response = await axios.post(`${API_BASE}/products/simulation-mode`, { mode });
  clearApiCache();
  return response.data;
};

export const fetchSimulationMode = async () => {
  const url = `${API_BASE}/products/simulation-mode`;
  return getCachedOrFetch(url);
};

export const fetchRainforestReviews = async (asin, amazon_domain = 'amazon.in') => {
  const response = await axios.get(`${API_BASE}/reviews/rainforest`, {
    params: { asin, amazon_domain }
  });
  return response.data;
};

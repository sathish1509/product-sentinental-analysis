const { setSimulationMode, getSimulationMode } = require('../services/externalReviewApi');

const catalogProducts = [
  {
    product_id: 'AMZ-B001E4KFG0',
    product_name: 'Vitality Canned Dog Food & Organic Stew',
    category: 'Grocery & Gourmet',
    platform: 'Amazon',
    average_rating: 4.7,
    total_reviews: 450,
    image_url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80',
    description: 'All-natural gourmet canned dog food crafted with organic chicken, wholesome vegetables, and vital nutrients.'
  },
  {
    product_id: 'AMZ-B00813GRG4',
    product_name: 'Jumbo Salted Peanuts & Roasted Snacks',
    category: 'Grocery & Gourmet',
    platform: 'Amazon',
    average_rating: 4.5,
    total_reviews: 320,
    image_url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80',
    description: 'Freshly roasted jumbo Virginia peanuts lightly seasoned with sea salt for crunch and flavor.'
  },
  {
    product_id: 'FK-101',
    product_name: 'Candes 12 L Room/Personal Air Cooler',
    category: 'Home Appliances',
    platform: 'Flipkart',
    average_rating: 4.3,
    total_reviews: 280,
    image_url: 'https://images.unsplash.com/photo-1618941723628-e77a28e3b5e4?auto=format&fit=crop&w=600&q=80',
    description: 'Compact personal desert air cooler with honeycomb cooling pads, 3-speed control, and energy efficient motor.'
  },
  {
    product_id: 'FK-102',
    product_name: 'Pigeon Favourite Electric Kettle (1.5 L)',
    category: 'Home Appliances',
    platform: 'Flipkart',
    average_rating: 4.4,
    total_reviews: 510,
    image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?auto=format&fit=crop&w=600&q=80',
    description: 'Stainless steel cordless fast-boiling electric kettle with automatic shut-off and boil-dry protection.'
  },
  {
    product_id: 'PROD-101',
    product_name: 'SonicPro Wireless Noise-Canceling Headphones',
    category: 'Audio',
    platform: 'Direct',
    average_rating: 4.6,
    total_reviews: 128,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    description: 'Premium active noise-canceling headphones featuring 30-hour battery life and custom dynamic acoustic drivers.'
  },
  {
    product_id: 'PROD-102',
    product_name: 'UltraView 4K OLED Smart TV 55-inch',
    category: 'Electronics',
    platform: 'Direct',
    average_rating: 4.8,
    total_reviews: 94,
    image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80',
    description: 'Self-lit OLED panel delivering cinema-grade contrast, Dolby Vision HDR, and 120Hz smooth gaming support.'
  },
  {
    product_id: 'PROD-103',
    product_name: 'FitPulse Pro Smartwatch Series 5',
    category: 'Wearables',
    platform: 'Direct',
    average_rating: 4.2,
    total_reviews: 215,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    description: 'Advanced fitness smartwatch with built-in GPS, blood oxygen tracking, heart rate monitoring, and 7-day battery.'
  }
];

const getProducts = async (req, res) => {
  try {
    res.json({
      success: true,
      count: catalogProducts.length,
      products: catalogProducts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = catalogProducts.find(p => p.product_id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateApiSimulationMode = async (req, res) => {
  try {
    const { mode } = req.body;
    setSimulationMode(mode);
    res.json({
      success: true,
      current_mode: getSimulationMode(),
      message: `API simulation mode updated to ${mode}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getApiSimulationMode = async (req, res) => {
  res.json({
    success: true,
    current_mode: getSimulationMode()
  });
};

module.exports = {
  getProducts,
  getProductById,
  updateApiSimulationMode,
  getApiSimulationMode
};

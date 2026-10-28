const { exec } = require('child_process');
const path = require('path');

const predictSentiment = async (reviewText, rating = null) => {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, '..', 'predict.py');
    const pythonBin = process.env.PYTHON_PATH || 'python';
    
    const escapedText = reviewText.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const cmd = `"${pythonBin}" "${pythonScript}" "${escapedText}"`;

    exec(cmd, { timeout: 4000 }, (error, stdout, stderr) => {
      if (!error && stdout) {
        try {
          const result = JSON.parse(stdout.trim());
          if (result.sentiment) {
            return resolve(result);
          }
        } catch (e) {
          // Parse error, fallback below
        }
      }

      // JavaScript Heuristic Rule Fallback if Python execution is unavailable
      let sentiment = 'neutral';
      let confidence = 0.70;

      if (rating) {
        if (rating <= 2) sentiment = 'negative';
        else if (rating >= 4) sentiment = 'positive';
        else sentiment = 'neutral';
        confidence = 0.85;
      } else {
        const textLower = reviewText.toLowerCase();
        const posWords = ['great', 'excellent', 'amazing', 'love', 'superb', 'best', 'good', 'fast', 'smooth'];
        const negWords = ['terrible', 'bad', 'horrible', 'worst', 'broken', 'poor', 'disappointed', 'sucks', 'slow'];

        const posHits = posWords.filter(w => textLower.includes(w)).length;
        const negHits = negWords.filter(w => textLower.includes(w)).length;

        if (posHits > negHits) {
          sentiment = 'positive';
          confidence = 0.82;
        } else if (negHits > posHits) {
          sentiment = 'negative';
          confidence = 0.80;
        }
      }

      const aspectKeywords = {
        'Price': ['price', 'expensive', 'cheap', 'cost', 'worth', 'money', 'value'],
        'Quality': ['quality', 'sound', 'picture', 'display', 'screen', 'audio', 'build'],
        'Battery': ['battery', 'charge', 'charging', 'power', 'drain', 'hours', 'life'],
        'Performance': ['fast', 'speed', 'lag', 'processor', 'smooth', 'snappy', 'slow'],
        'Delivery': ['delivery', 'shipping', 'package', 'arrived', 'box', 'damaged'],
        'Design': ['design', 'cushion', 'strap', 'weight', 'heavy', 'light', 'bright'],
        'Durability': ['hinge', 'broke', 'snapped', 'water', 'sensor', 'cracked'],
        'Customer Service': ['support', 'service', 'warranty', 'refund', 'replacement', 'help']
      };

      const textLower = reviewText.toLowerCase();
      const aspects = Object.keys(aspectKeywords).filter(asp => 
        aspectKeywords[asp].some(kw => textLower.includes(kw))
      );

      resolve({ sentiment, confidence, aspects });
    });
  });
};

module.exports = { predictSentiment };

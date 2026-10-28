const http = require('http');
const express = require('express');
const app = express();
app.use(express.json());

app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

const server = app.listen(5099, async () => {
  console.log('[*] Test server running on port 5099');

  // Test 1: GET /api/products
  http.get('http://localhost:5099/api/products', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('[+] /api/products response:', JSON.parse(data).count, 'products found');

      // Test 2: GET /api/reviews/products/PROD-101/reviews
      http.get('http://localhost:5099/api/reviews/products/PROD-101/reviews', (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          const parsed = JSON.parse(data2);
          console.log('[+] /api/reviews response source:', parsed.source, 'count:', parsed.count);

          server.close(() => {
            console.log('[+] Verification complete. Server closed.');
            process.exit(0);
          });
        });
      });
    });
  });
});

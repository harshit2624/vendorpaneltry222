const express = require('express');
const cors = require('cors');
const Shopify = require('shopify-api-node');
const axios = require('axios');
require('dotenv').config();

const requiredVars = ['SHOPIFY_STORE', 'SHOPIFY_CLIENT_ID', 'SHOPIFY_CLIENT_SECRET'];
const missingVars = requiredVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    console.error('Missing env vars:', missingVars.join(', '));
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Optional OAuth routes (uncomment if public app)
// const shopifyApiKey = process.env.SHOPIFY_CLIENT_ID;
// const shopifyApiSecret = process.env.SHOPIFY_CLIENT_SECRET;
// const shopifyShopName = process.env.SHOPIFY_STORE.replace('.myshopify.com', '');
// ... OAuth code ...


let shopify = null;

app.post('/api/setup', async (req, res) => {
  try {
    const { store, clientId, clientSecret } = req.body;
    const shopName = (store || process.env.SHOPIFY_STORE.replace('.myshopify.com', '')).replace('.myshopify.com', '');
    shopify = new Shopify({
      shopName,
      accessToken: clientSecret || process.env.SHOPIFY_CLIENT_SECRET  // shpss_ prefix indicates offline access token
    });
    // Test connection
    await shopify.shop.get();
    res.json({ success: true, message: 'Shopify connected' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    if (!shopify) {
      return res.status(400).json({ error: 'Run /api/setup first' });
    }
    const orders = await shopify.order.list({ limit: 10 });
    res.json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Shopify Vendor Panel Backend - Orders API ready');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

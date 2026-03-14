const express = require('express');
const cors = require('cors');
const Shopify = require('shopify-api-node');
const axios = require('axios');
require('dotenv').config({ path: __dirname + '/.env' });

if (!process.env.SHOPIFY_SHOP_NAME || !process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
    console.error('Error: Missing Shopify environment variables. Please check your backend/.env file.');
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const shopifyApiKey = process.env.SHOPIFY_API_KEY;
const shopifyApiSecret = process.env.SHOPIFY_API_SECRET;
const shopifyShopName = process.env.SHOPIFY_SHOP_NAME.replace('.myshopify.com', '');
const scopes = 'read_orders';
const redirectUri = `http://localhost:${port}/shopify/callback`;

app.get('/shopify/auth', (req, res) => {
    const authUrl = `https://{shop}.myshopify.com/admin/oauth/authorize?client_id=${shopifyApiKey}&scope=${scopes}&redirect_uri=${redirectUri}`
        .replace('{shop}', shopifyShopName);
    res.redirect(authUrl);
});

app.get('/shopify/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('Missing authorization code');
    }

    const tokenUrl = `https://{shop}.myshopify.com/admin/oauth/access_token`
        .replace('{shop}', shopifyShopName);

    const payload = {
        client_id: shopifyApiKey,
        client_secret: shopifyApiSecret,
        code,
    };

    try {
        const response = await axios.post(tokenUrl, payload);
        const accessToken = response.data.access_token;

        console.log('---');
        console.log('Your Shopify Access Token is:');
        console.log(accessToken);
        console.log('---');
        console.log('Please copy this token and save it in your backend/.env file as SHOPIFY_ACCESS_TOKEN');
        console.log('---');


        res.send('Access token retrieved successfully! Check your server console.');
    } catch (error) {
        console.error('Error retrieving access token:', error.response ? error.response.data : error.message);
        res.status(500).send('Error retrieving access token');
    }
});


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

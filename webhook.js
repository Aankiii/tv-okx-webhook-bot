const axios = require('axios');
const sign = require('../utils/sign');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  const { action, symbol, margin, leverage, price, order_type, mode } = req.body;

  const apiKey = process.env.OKX_API_KEY;
  const secretKey = process.env.OKX_API_SECRET;
  const passphrase = process.env.OKX_API_PASSPHRASE;

  if (!apiKey || !secretKey || !passphrase) {
    return res.status(500).json({ error: 'Missing API credentials' });
  }

  const timestamp = new Date().toISOString();
  const method = 'POST';
  const requestPath = '/api/v5/trade/order';
  const body = JSON.stringify({
    instId: symbol,
    tdMode: mode,
    side: action.toLowerCase(),
    ordType: order_type,
    sz: ((margin * leverage) / price).toFixed(4),
    posSide: 'long',
  });

  const signature = sign(secretKey, timestamp, method, requestPath, body);

  try {
    const response = await axios.post(`https://www.okx.com${requestPath}`, JSON.parse(body), {
      headers: {
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': passphrase,
      },
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  const COINGECKO_API = 'https://api.coingecko.com/api/v3';
  const FETCH_OPTIONS = {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    signal: AbortSignal.timeout(8000) // 8s timeout
  };

  const MOCK_COINS = [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 64230.50, market_cap: 1260450000000, market_cap_rank: 1, total_volume: 35000000000, high_24h: 65000, low_24h: 63000, price_change_percentage_24h: 1.25, ath: 73737, atl: 67.81, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', sparkline_in_7d: { price: [63000, 64000, 63500, 64500, 64230] } },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3450.20, market_cap: 415000000000, market_cap_rank: 2, total_volume: 15000000000, high_24h: 3500, low_24h: 3300, price_change_percentage_24h: -2.1, ath: 4878, atl: 0.43, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', sparkline_in_7d: { price: [3500, 3400, 3350, 3450, 3450] } },
    { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.00, market_cap: 110000000000, market_cap_rank: 3, total_volume: 55000000000, high_24h: 1.01, low_24h: 0.99, price_change_percentage_24h: 0.01, ath: 1.32, atl: 0.57, image: 'https://assets.coingecko.com/coins/images/325/large/tether.png', sparkline_in_7d: { price: [1, 1, 1, 1, 1] } },
    { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 580.40, market_cap: 85000000000, market_cap_rank: 4, total_volume: 2000000000, high_24h: 590, low_24h: 570, price_change_percentage_24h: 0.5, ath: 717, atl: 0.03, image: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png', sparkline_in_7d: { price: [570, 580, 575, 585, 580] } },
    { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 145.20, market_cap: 65000000000, market_cap_rank: 5, total_volume: 4000000000, high_24h: 150, low_24h: 140, price_change_percentage_24h: 4.5, ath: 259, atl: 0.50, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', sparkline_in_7d: { price: [140, 145, 142, 148, 145] } }
  ];

  const MOCK_RATES = {
    usd: { value: 64230 },
    inr: { value: 5350000 }
  };

  const MOCK_DETAIL = {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    market_cap_rank: 1,
    description: { en: 'Bitcoin is a decentralized digital currency, without a central bank or single administrator, that can be sent from user to user on the peer-to-peer bitcoin network without the need for intermediaries.' },
    image: { small: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
    links: { homepage: ['https://bitcoin.org/'] },
    genesis_date: '2009-01-03',
    market_data: {
      current_price: { usd: 64230.50 },
      ath: { usd: 73737 },
      atl: { usd: 67.81 }
    }
  };

  // API Proxy Routes
  app.get('/api/coins/markets', async (req, res) => {
    try {
      const { per_page = 20, vs_currency = 'usd' } = req.query;
      console.log(`[Proxy] Fetching market data...`);
      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=${vs_currency}&order=market_cap_desc&per_page=${per_page}&page=1&sparkline=true&price_change_percentage=24h`,
        FETCH_OPTIONS
      );
      if (!response.ok) {
        console.warn(`[Proxy] API failed (${response.status}), using mock data.`);
        return res.json(MOCK_COINS);
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('[Proxy] Market fetch error, falling back to mock.');
      res.json(MOCK_COINS);
    }
  });

  app.get('/api/exchange-rate', async (req, res) => {
    try {
      const response = await fetch(`${COINGECKO_API}/exchange_rates`, FETCH_OPTIONS);
      if (!response.ok) {
        console.warn(`[Proxy] Rate API failed, using mock.`);
        return res.json(MOCK_RATES);
      }
      const data = await response.json();
      res.json(data.rates || MOCK_RATES);
    } catch (error) {
      res.json(MOCK_RATES);
    }
  });

  app.get('/api/coins/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const response = await fetch(
        `${COINGECKO_API}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
        FETCH_OPTIONS
      );
      if (!response.ok) {
        console.warn(`[Proxy] Detail fetch failed for ${id}, using mock.`);
        // Try to match mock name/id
        return res.json({ ...MOCK_DETAIL, id, name: id.charAt(0).toUpperCase() + id.slice(1) });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(`[Proxy] Detail internal error for ${id}, using mock.`);
      res.json({ ...MOCK_DETAIL, id, name: id.charAt(0).toUpperCase() + id.slice(1) });
    }
  });

  app.get('/api/coins/:id/chart', async (req, res) => {
    const { id } = req.params;
    try {
      const { days = '365' } = req.query;
      const response = await fetch(
        `${COINGECKO_API}/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
        FETCH_OPTIONS
      );
      if (!response.ok) {
        return res.json({ prices: Array.from({length: 30}, (_, i) => [Date.now() - (30-i)*86400000, 60000 + Math.random()*5000]) });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.json({ prices: [] });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'active', platform: 'Etheria Gateway' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();

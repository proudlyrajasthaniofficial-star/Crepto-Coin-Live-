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
    }
  };

  // API Proxy Routes
  app.get('/api/coins/markets', async (req, res) => {
    try {
      const { per_page = 20, vs_currency = 'usd' } = req.query;
      console.log(`[Proxy] Fetching top coins: per_page=${per_page}, currency=${vs_currency}`);
      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=${vs_currency}&order=market_cap_desc&per_page=${per_page}&page=1&sparkline=true&price_change_percentage=24h`,
        FETCH_OPTIONS
      );
      if (!response.ok) {
        console.error(`[Proxy] CoinGecko Error: ${response.status}`);
        return res.status(response.status).json({ error: 'CoinGecko Error' });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('[Proxy] Internal Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/exchange-rate', async (req, res) => {
    try {
      const response = await fetch(`${COINGECKO_API}/simple/price?ids=usd-coin&vs_currencies=inr`, FETCH_OPTIONS);
      if (!response.ok) return res.status(response.status).json({ error: 'Fetch failed' });
      const data = await response.json();
      // CoinGecko returns something like {"usd-coin": {"inr": 83.5}}
      // But actually better is to use /exchange_rates
      const ratesResponse = await fetch(`${COINGECKO_API}/exchange_rates`, FETCH_OPTIONS);
      const ratesData = await ratesResponse.json();
      res.json(ratesData.rates);
    } catch (error) {
      res.status(500).json({ error: 'Internal Error' });
    }
  });

  app.get('/api/coins/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[Proxy] Fetching coin detail: ${id}`);
      const response = await fetch(
        `${COINGECKO_API}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
        FETCH_OPTIONS
      );
      if (!response.ok) {
        console.error(`[Proxy] CoinGecko Error: ${response.status}`);
        return res.status(response.status).json({ error: 'CoinGecko Error' });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('[Proxy] Internal Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/coins/:id/chart', async (req, res) => {
    try {
      const { id } = req.params;
      const { days = '365' } = req.query;
      console.log(`[Proxy] Fetching chart: ${id}, days=${days}`);
      const response = await fetch(
        `${COINGECKO_API}/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
        FETCH_OPTIONS
      );
      if (!response.ok) {
        console.error(`[Proxy] CoinGecko Error: ${response.status}`);
        return res.status(response.status).json({ error: 'CoinGecko Error' });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('[Proxy] Internal Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
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

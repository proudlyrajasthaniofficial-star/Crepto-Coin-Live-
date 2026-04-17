import { ChartData, CoinData, CoinDetail } from '../types';

const API_BASE = '/api';

export async function fetchTopCoins(limit: number = 20): Promise<CoinData[]> {
  try {
    const response = await fetch(
      `${API_BASE}/coins/markets?vs_currency=usd&per_page=${limit}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Frontend] FetchTopCoins failed: ${response.status} - ${errorText}`);
      throw new Error(`Market fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Frontend] Network Error (fetchTopCoins):', error);
    return [];
  }
}

export async function fetchCoinDetail(id: string): Promise<CoinDetail | null> {
  try {
    const response = await fetch(`${API_BASE}/coins/${id}`);
    if (!response.ok) {
      console.warn(`[Frontend] Detail fetch failed: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error in fetchCoinDetail:', error);
    return null;
  }
}

export async function fetchCoinChart(id: string, days: string = '365'): Promise<ChartData | null> {
  try {
    const response = await fetch(`${API_BASE}/coins/${id}/chart?days=${days}`);
    if (!response.ok) throw new Error('Chart fetch failed');
    return await response.json();
  } catch (error) {
    console.error('Error fetching coin chart:', error);
    return null;
  }
}

export async function fetchExchangeRates(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/exchange-rate`);
    if (!response.ok) throw new Error('Failed to fetch exchange rates');
    return await response.json();
  } catch (error) {
    console.error('Exchange rate error:', error);
    return null;
  }
}

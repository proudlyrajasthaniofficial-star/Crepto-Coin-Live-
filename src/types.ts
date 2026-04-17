export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
  ath: number;
  ath_change_percentage: number;
  atl: number;
  atl_change_percentage: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath_date: string;
  atl_date: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface CoinDetail extends CoinData {
  description: { en: string };
  genesis_date: string | null;
  links: {
    homepage: string[];
    blockchain_site: string[];
  };
  market_data: {
    current_price: { [key: string]: number };
    ath: { [key: string]: number };
    atl: { [key: string]: number };
    high_24h: { [key: string]: number };
    low_24h: { [key: string]: number };
  };
}

export interface ChartData {
  prices: [number, number][];
}

export interface MousePosition {
  x: number;
  y: number;
}

import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { ArrowDown, Loader2, Zap } from 'lucide-react';
import { fetchTopCoins, fetchExchangeRates } from './services/crypto';
import { CoinData } from './types';
import InteractiveBackground from './components/InteractiveBackground';
import CoinListItem from './components/CoinListItem';
import CoinDetailView from './components/CoinDetailView';

export default function App() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [usdToInr, setUsdToInr] = useState<number>(0);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    async function loadData() {
      try {
        const [coinData, rateData] = await Promise.all([
          fetchTopCoins(25),
          fetchExchangeRates()
        ]);
        setCoins(coinData);
        if (rateData && rateData.inr && rateData.usd) {
          // Rate is units per BTC. So (INR/BTC) / (USD/BTC) = INR/USD
          const rate = rateData.inr.value / rateData.usd.value;
          setUsdToInr(rate);
        }
      } catch (err) {
        setError('Failed to fetch real-time market data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // Refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCoinClick = (coin: CoinData) => {
    setSelectedCoinId(coin.id);
  };

  return (
    <div className={`min-h-screen ${selectedCoinId ? 'overflow-hidden h-screen' : ''}`}>
      <InteractiveBackground />
      
      <AnimatePresence>
        {selectedCoinId && (
          <CoinDetailView 
            coinId={selectedCoinId} 
            onClose={() => setSelectedCoinId(null)} 
            usdToInr={usdToInr}
          />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8 flex justify-between items-center bg-gradient-to-b from-premium-black to-transparent">
        <div className="flex items-center gap-2">
          <Zap className="text-neon-blue w-8 h-8 fill-neon-blue" />
          <span className="font-display font-extrabold text-2xl tracking-tighter">ETHERIA</span>
        </div>
        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-white/50">
          <a href="#" className="hover:text-neon-blue transition-colors">Markets</a>
          <a href="#" className="hover:text-neon-purple transition-colors">Trade</a>
          <a href="#" className="hover:text-neon-pink transition-colors">Analytics</a>
        </div>
        <button className="glass-morphism px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          Connect Wallet
        </button>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen flex flex-col items-center justify-center pt-20 px-4 overflow-hidden">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="text-center space-y-8 z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block glass-morphism px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-neon-blue mb-4"
          >
            Live Market Insights 2.0
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-white"
          >
            FUTURE OF <br /> 
            <span className="text-gradient">DIGITAL ASSETS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto text-white/40 font-medium text-lg md:text-xl leading-relaxed"
          >
            Experience lightning-fast analytics with high-fidelity visualization. 
            Track real-time fluctuations, historical peaks, and market domination.
          </motion.p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 flex flex-col items-center gap-2 text-white/20"
        >
          <span className="text-[10px] uppercase font-bold tracking-[0.3em]">Explore Markets</span>
          <ArrowDown size={20} />
        </motion.div>
      </header>

      {/* Market List Section */}
      <main className="max-w-7xl mx-auto px-6 pb-40">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="space-y-4">
            <h2 className="font-display text-5xl font-bold">Real-time <br /> Performance</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full" />
          </div>
          <div className="flex gap-12 font-mono text-sm">
            <div className="text-white/40">
              <span className="block font-bold text-white mb-1">{coins.length}</span>
              Tracked
            </div>
            <div className="text-white/40">
              <p className="font-bold text-white mb-1">
                ${coins.reduce((acc, c) => acc + c.market_cap, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              {usdToInr > 0 && (
                <p className="text-[10px] font-mono text-neon-blue leading-none">
                  ₹{(coins.reduce((acc, c) => acc + c.market_cap, 0) * usdToInr).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              )}
              Total Cap
            </div>
            <div className="text-white/40">
              <span className="block font-bold text-white mb-1">24H</span>
              Precision
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-neon-blue" size={48} />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Synchronizing nodes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-40 glass-morphism rounded-3xl">
            <p className="text-pink-500 font-bold">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 text-sm text-neon-blue underline"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 gap-4"
          >
            {coins.map((coin, i) => (
              <motion.div
                key={coin.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <CoinListItem 
                  coin={coin} 
                  index={i} 
                  onClick={handleCoinClick}
                  usdToInr={usdToInr}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2">
            <Zap className="text-white/20 w-6 h-6" />
            <span className="font-display font-black text-xl tracking-tighter text-white/20">ETHERIA</span>
          </div>
          <p className="text-white/20 text-xs font-mono">
            &copy; 2026 ETHERIA LABS. DATA PROVIDED BY COINGECKO.
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/30">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

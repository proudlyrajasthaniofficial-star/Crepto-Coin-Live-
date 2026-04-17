import { motion, AnimatePresence } from 'motion/react';
import React, { useEffect, useState, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Info, Calendar, Activity, ChevronUp, ChevronDown } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, AreaProps } from 'recharts';
import { CoinData, CoinDetail, ChartData } from '../types';
import { fetchCoinDetail, fetchCoinChart } from '../services/crypto';

interface CoinDetailViewProps {
  coinId: string | null;
  onClose: () => void;
  usdToInr?: number;
}

export default function CoinDetailView({ coinId, onClose, usdToInr }: CoinDetailViewProps) {
  const [detail, setDetail] = useState<CoinDetail | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!coinId) return;
    let isMounted = true;

    async function loadDetail() {
      setLoading(true);
      setShowContent(false);
      const [detailData, chartResults] = await Promise.all([
        fetchCoinDetail(coinId!),
        fetchCoinChart(coinId!, '365')
      ]);

      if (!isMounted) return;
      
      setDetail(detailData);
      setChartData(chartResults);
      
      // Animation timing: logo stays for a bit, then content slides up
      setTimeout(() => {
        if (isMounted) setShowContent(true);
      }, 1500);
      setLoading(false);
    }
    loadDetail();
    return () => { isMounted = false; };
  }, [coinId]);

  const stats = useMemo(() => {
    if (!chartData || !chartData.prices) return null;
    const prices = chartData.prices.map(p => p[1]);
    
    // Last 30 days
    const monthPrices = prices.slice(-30);
    const monthHigh = Math.max(...monthPrices);
    const monthLow = Math.min(...monthPrices);
    
    // Last 365 days
    const yearHigh = Math.max(...prices);
    const yearLow = Math.min(...prices);

    return { monthHigh, monthLow, yearHigh, yearLow };
  }, [chartData]);

  const formattedChartData = useMemo(() => {
    if (!chartData) return [];
    return chartData.prices.map(p => ({
      time: new Date(p[0]).toLocaleDateString(),
      price: p[1]
    }));
  }, [chartData]);

  if (!coinId) return null;

  if (!loading && !detail) {
    return (
      <div className="fixed inset-0 z-[100] bg-premium-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-2xl font-bold mb-4">Core Synchronizing...</h3>
        <p className="text-white/40 mb-8 max-w-md">We're experiencing temporary synchronization issues with this asset's core data hub.</p>
        <button onClick={onClose} className="glass-morphism px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-premium-black/95 backdrop-blur-xl flex flex-col items-center justify-center overflow-auto"
      >
        {/* Splash Phase: logo appearing full screen */}
        {!showContent ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0, y: -100 }}
            className="flex flex-col items-center gap-6 md:gap-8 px-4"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <img 
                src={detail?.image?.large || undefined} 
                alt="coin-logo" 
                referrerPolicy="no-referrer"
                className="w-32 h-32 md:w-48 md:h-48 rounded-full"
              />
              <div className="absolute -inset-8 bg-neon-blue/20 blur-3xl rounded-full -z-10 animate-pulse" />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl md:text-6xl font-display font-black tracking-tighter text-gradient text-center"
            >
              {detail?.name || 'Loading Core...'}
            </motion.h2>
          </motion.div>
        ) : (
          /* Content Phase: Full Information */
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full p-4 md:p-12 max-w-7xl mx-auto space-y-8 md:space-y-12"
          >
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
                <motion.img 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  src={detail?.image?.small || undefined} 
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full" 
                />
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tighter flex flex-col sm:flex-row items-center gap-1 sm:gap-4">
                    {detail?.name}
                    <span className="text-neon-blue font-mono text-sm md:text-xl opacity-50 uppercase">{detail?.symbol}</span>
                  </h1>
                  <p className="text-white/40 font-mono text-[10px] md:text-sm">Market Rank #{detail?.market_cap_rank}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="glass-morphism h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all order-first sm:order-last self-end sm:self-auto"
              >
                <X size={20} />
              </button>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Chart Section */}
              <div className="lg:col-span-2 glass-morphism rounded-3xl p-4 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4">
                  <h3 className="font-display text-lg md:text-2xl font-bold flex items-center gap-2">
                    <Activity className="text-neon-blue w-5 h-5 md:w-6 md:h-6" />
                    Performance (1Y)
                  </h3>
                  <div className="text-center sm:text-right">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Current Valuation</p>
                    <p className="text-xl md:text-3xl font-mono">${detail?.market_data.current_price.usd.toLocaleString()}</p>
                    {usdToInr && usdToInr > 0 && detail && (
                      <p className="text-xs md:text-sm font-mono text-neon-blue">
                        ₹{(detail.market_data.current_price.usd * usdToInr).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="h-[250px] sm:h-[300px] md:h-[400px] w-full mt-4 md:mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedChartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0d0d0d', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                        itemStyle={{ color: '#00f2ff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#00f2ff" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                <div className="glass-morphism rounded-3xl p-6 space-y-6">
                  <h3 className="font-display text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="text-neon-purple" />
                    Market Dominance
                  </h3>
                  
                  <div className="space-y-4">
                    <StatItem label="Launch Date" value={detail?.genesis_date || 'N/A'} icon={<Calendar size={14} />} color="blue" />
                    <StatItem label="All Time High" value={`$${detail?.market_data.ath.usd.toLocaleString()}`} icon={<TrendingUp size={14} />} color="green" />
                    <StatItem label="Yearly High" value={`$${stats?.yearHigh.toLocaleString()}`} icon={<ChevronUp size={14} />} color="green" />
                    <StatItem label="Monthly High" value={`$${stats?.monthHigh.toLocaleString()}`} icon={<ChevronUp size={14} />} color="green" />
                    <StatItem label="Yearly Low" value={`$${stats?.yearLow.toLocaleString()}`} icon={<ChevronDown size={14} />} color="pink" />
                    <StatItem label="Monthly Low" value={`$${stats?.monthLow.toLocaleString()}`} icon={<ChevronDown size={14} />} color="pink" />
                    <StatItem label="All Time Low" value={`$${detail?.market_data.atl.usd.toLocaleString()}`} icon={<TrendingDown size={14} />} color="pink" />
                  </div>
                </div>

                <div className="glass-morphism rounded-3xl p-6 space-y-4">
                  <h3 className="font-display text-xl font-bold flex items-center gap-2">
                    <Info className="text-neon-pink" />
                    About {detail?.name}
                  </h3>
                  <div className="text-white/60 text-sm leading-relaxed max-h-[300px] overflow-y-auto font-sans scrollbar-hide">
                    <div dangerouslySetInnerHTML={{ __html: detail?.description.en || '' }} />
                  </div>
                  {detail?.links.homepage[0] && (
                    <a 
                      href={detail.links.homepage[0]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-4 block text-center glass-morphism py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:text-neon-blue transition-colors"
                    >
                      Official Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function StatItem({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  const colors = {
    blue: 'text-neon-blue',
    green: 'text-green-400',
    pink: 'text-pink-500',
    purple: 'text-neon-purple'
  };
  
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className={`font-mono font-medium ${colors[color as keyof typeof colors]}`}>
        {value}
      </div>
    </div>
  );
}


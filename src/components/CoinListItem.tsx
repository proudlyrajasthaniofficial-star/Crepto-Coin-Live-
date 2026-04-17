import { motion, useScroll, useTransform } from 'motion/react';
import React, { useRef } from 'react';
import { CoinData } from '../types';
import Sparkline from './Sparkline';

interface CoinListItemProps {
  coin: CoinData;
  index: number;
  onClick: (coin: CoinData) => void;
  usdToInr?: number;
}

const CoinListItem: React.FC<CoinListItemProps> = ({ coin, onClick, usdToInr }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax movement: moves faster or slower than scroll
  const yOffset = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  
  // Transitioning to display text: opacity and scale based on scroll
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  
  // Color shifting based on scroll
  const glowOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 0.4, 0]);

  const isPositive = coin.price_change_percentage_24h > 0;

  return (
    <motion.div
      ref={containerRef}
      style={{ y: yOffset, opacity, scale }}
      className="relative group mb-12 cursor-pointer"
      onClick={() => onClick(coin)}
    >
      <div className="glass-morphism rounded-2xl p-6 transition-all duration-500 hover:ring-2 hover:ring-neon-blue/50 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
        {/* Glowing layer */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 pointer-events-none"
          style={{ opacity: glowOpacity }}
        />

        {/* Rank & Logo */}
        <div className="flex items-center gap-6 z-10">
          <span className="font-display text-4xl font-extrabold opacity-20 text-white/50">
            {String(coin.market_cap_rank).padStart(2, '0')}
          </span>
          <div className="relative">
            <motion.img 
              src={coin.image || undefined} 
              alt={coin.name} 
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.8, type: "spring" }}
            />
            <div className="absolute -inset-1 bg-neon-blue/30 blur-lg rounded-full -z-10 group-hover:bg-neon-blue/60 transition-colors" />
          </div>
        </div>

        {/* Info Section - This "transitions" as we scroll via the parent motion.div */}
        <div className="flex-1 z-10 space-y-2">
          <div className="flex items-baseline gap-3">
            <h3 className="font-display text-3xl font-bold tracking-tight">{coin.name}</h3>
            <span className="text-neon-blue font-mono font-medium text-lg uppercase">{coin.symbol}</span>
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Current Price</p>
              <div className="flex flex-col">
                <p className="text-2xl font-mono text-white leading-none">
                  ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                {usdToInr && usdToInr > 0 && (
                  <p className="text-sm font-mono text-neon-blue mt-1 opacity-80">
                    ₹{(coin.current_price * usdToInr).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">24h Change</p>
              <p className={`text-2xl font-mono ${isPositive ? 'text-green-400' : 'text-pink-500'}`}>
                {isPositive ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
              </p>
            </div>

            <div className="space-y-1 hidden lg:block">
              <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">All Time High</p>
              <p className="text-sm font-mono text-green-400">
                ${coin.ath.toLocaleString()}
              </p>
            </div>

            <div className="space-y-1 hidden lg:block">
              <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">All Time Low</p>
              <p className="text-sm font-mono text-pink-500">
                ${coin.atl.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="w-full md:w-48 h-16 z-10">
          <div className="h-full w-full opacity-60 hover:opacity-100 transition-opacity">
            {coin.sparkline_in_7d && (
              <Sparkline 
                data={coin.sparkline_in_7d.price} 
                color={isPositive ? '#00f2ff' : '#ff00ff'} 
              />
            )}
          </div>
          <p className="text-[10px] text-center mt-2 text-white/30 uppercase font-bold tracking-tighter">7D Trend</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CoinListItem;

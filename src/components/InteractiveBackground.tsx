import { motion, useSpring, useTransform, useMotionValue } from 'motion/react';
import { useEffect } from 'react';

export default function InteractiveBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute inset-0 bg-mesh opacity-30" />
      
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{
          x: useTransform(springX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [-300, 300]),
          y: useTransform(springY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [-300, 300]),
          background: 'radial-gradient(circle, rgba(0, 242, 255, 0.15) 0%, transparent 70%)',
          left: '20%',
          top: '20%',
        }}
      />
      
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-[150px]"
        style={{
          x: useTransform(springX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [300, -300]),
          y: useTransform(springY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [300, -300]),
          background: 'radial-gradient(circle, rgba(188, 19, 254, 0.1) 0%, transparent 70%)',
          right: '10%',
          bottom: '10%',
        }}
      />
    </div>
  );
}

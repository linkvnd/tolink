import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function FallingFlowers() {
  const [flowers, setFlowers] = useState<{ id: number; left: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const newFlowers = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10,
    }));
    setFlowers(newFlowers);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {flowers.map((flower) => (
        <motion.div
          key={flower.id}
          className="absolute top-[-50px] text-pink-300 opacity-50 text-xl"
          initial={{ y: -50, x: 0, rotate: 0 }}
          animate={{
            y: '110vh',
            x: Math.random() * 100 - 50,
            rotate: 360,
          }}
          transition={{
            duration: flower.duration,
            delay: flower.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ left: `${flower.left}%` }}
        >
          🌸
        </motion.div>
      ))}
    </div>
  );
}

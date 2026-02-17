import React from 'react';
import { motion } from 'framer-motion';

const HeroBanner: React.FC = () => {
  return (
    <div className="relative h-[70vh] bg-gradient-to-b from-gray-900 to-black">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent"
          >
            PaixãoFlix
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-8"
          >
            As melhores séries para você
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;

import { ChevronDown, Zap } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function HowItWorks() {
  const [isExpanded, setIsExpanded] = useState(true);

  const steps = [
    { text: 'Deposit DONUT into the active pool.', icon: '💰' },
    { text: 'The target price drops over time (Dutch Auction).', icon: '⏰' },
    { text: 'When Pool Funds ≥ Target Price, the pool automatically mines.', icon: '⚡' },
    { text: 'If the pool wins, you get Donuettes. If outbid, you get DONUT profit.', icon: '🏆' },
  ];

  return (
    <motion.div
      className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all group"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
          <h3 className="text-amber-900">How it works</h3>
        </div>
        <motion.div
          className={`p-2 bg-amber-100 rounded-lg ${isExpanded ? 'rotate-180' : ''}`}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-amber-700" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="px-8 pb-8 border-t border-amber-100"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4 mt-6">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="group flex gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all hover:shadow-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur opacity-50" />
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg">
                      <span className="text-xl">{step.icon}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs text-amber-700 shadow-md border-2 border-amber-200">
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-amber-800 pt-2 flex-1">{step.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

import { Eye, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

interface YourPositionProps {
  userDeposit: bigint;
  poolShare: number;
  formatDonut: (val: bigint) => string;
  onViewPastPools?: () => void;
}

export function YourPosition({ userDeposit, poolShare, formatDonut, onViewPastPools }: YourPositionProps) {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg"
            animate={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            <PieChart className="w-4 h-4 text-white" />
          </motion.div>
          <h4 className="text-amber-900">Your Position</h4>
        </div>
        {onViewPastPools && (
          <motion.button
            onClick={onViewPastPools}
            className="group flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all border border-amber-200 hover:border-amber-300 hover:shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-4 h-4" />
            View Past Rewards
          </motion.button>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 rounded-3xl blur opacity-30" />
        <div className="relative grid grid-cols-2 gap-6 p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl border-2 border-purple-200/50 shadow-lg">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="absolute -top-2 -left-2 text-4xl opacity-10">💎</div>
            <div className="text-sm text-purple-700 mb-2">Your Deposit</div>
            <motion.div
              className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
              key={userDeposit.toString()}
              initial={{ scale: 1.1, color: '#ff99aa' }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {formatDonut(userDeposit)}
            </motion.div>
            <div className="text-xs text-purple-600 mt-1">DONUT</div>
          </motion.div>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="absolute -top-2 -right-2 text-4xl opacity-10">📊</div>
            <div className="text-sm text-pink-700 mb-2">Pool Share</div>
            <motion.div
              className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-600"
              key={poolShare.toFixed(2)}
              initial={{ scale: 1.1, color: '#ff99aa' }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {poolShare.toFixed(2)}%
            </motion.div>
            <div className="text-xs text-pink-600 mt-1">of total pool</div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

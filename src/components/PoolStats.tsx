import { TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface PoolStatsProps {
  progress: number;
  totalDeposited: bigint;
  targetAmount: bigint;
  participants: bigint;
  isReadyToMine: boolean;
  formatDonut: (val: bigint) => string;
}

export function PoolStats({ 
  progress, 
  totalDeposited, 
  targetAmount, 
  participants,
  isReadyToMine,
  formatDonut 
}: PoolStatsProps) {
  return (
    <motion.div
      className="space-y-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-amber-700">Status</span>
        <motion.div
          className="relative"
          animate={
            isReadyToMine
              ? {
                  scale: [1, 1.05, 1],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: isReadyToMine ? Infinity : 0,
          }}
        >
          <div className="absolute inset-0 bg-blue-400 blur-md opacity-50" />
          <span
            className={`relative px-4 py-2 rounded-full text-sm shadow-lg ${
              isReadyToMine
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            }`}
          >
            <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            {isReadyToMine ? 'READY TO MINE' : 'ACCUMULATING'}
          </span>
        </motion.div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700">Progress to Mine</span>
          </div>
          <motion.span
            className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600"
            key={progress}
            initial={{ scale: 1.2, color: '#ff99aa' }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {progress.toFixed(2)}%
          </motion.span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative w-full h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              className="absolute inset-0 bg-white/30"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
          <div className="absolute inset-0 rounded-full border-2 border-white/50" />
        </div>

        <div className="flex items-center justify-between mt-3">
          <motion.span
            className="text-sm text-amber-900"
            key={totalDeposited.toString()}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            💰 {formatDonut(totalDeposited)} DONUT raised
          </motion.span>
          <span className="text-sm text-amber-600">
            🎯 Target: {formatDonut(targetAmount)} DONUT
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200/50 shadow-md hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.05, borderColor: 'rgba(251, 191, 36, 0.8)' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex items-center gap-2 text-sm text-amber-700 mb-2">
            <div className="p-1.5 bg-amber-200 rounded-lg">
              💎
            </div>
            Total Deposited
          </div>
          <motion.div
            className="text-2xl text-amber-900"
            key={totalDeposited.toString()}
            initial={{ scale: 1.1, color: '#ff99aa' }}
            animate={{ scale: 1, color: 'inherit' }}
            transition={{ duration: 0.3 }}
          >
            {formatDonut(totalDeposited)}
          </motion.div>
          <div className="text-xs text-amber-600 mt-1">DONUT</div>
        </motion.div>
        <motion.div
          className="p-5 bg-gradient-to-br from-pink-50 to-orange-50 rounded-2xl border-2 border-pink-200/50 shadow-md hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.05, borderColor: 'rgba(236, 72, 153, 0.8)' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex items-center gap-2 text-sm text-pink-700 mb-2">
            <div className="p-1.5 bg-pink-200 rounded-lg">
              <Users className="w-3 h-3 text-pink-700" />
            </div>
            Participants
          </div>
          <motion.div
            className="text-2xl text-pink-900"
            key={participants.toString()}
            initial={{ scale: 1.1, color: '#ff99aa' }}
            animate={{ scale: 1, color: 'inherit' }}
            transition={{ duration: 0.3 }}
          >
            {participants.toString()}
          </motion.div>
          <div className="text-xs text-pink-600 mt-1">Active miners</div>
        </motion.div>
      </div>
    </motion.div>
  );
}

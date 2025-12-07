import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Gift, ChevronDown } from 'lucide-react';
import { Address } from 'viem';
import { DONUETTES_COMINING_ABI, DONUETTES_COMINING_ADDRESS } from '../pages/constant';

interface PastPoolsProps {
  formatDonut: (val: bigint) => string;
  isExpanded: boolean;
  onToggle: () => void;
}

interface PoolReward {
  poolId: bigint;
  donutReward: bigint;
  donuetteReward: bigint;
  canClaim: boolean;
}

// Component to fetch rewards for a single pool
function PoolRewardItem({ 
  poolId, 
  address, 
  formatDonut, 
  onClaim, 
  isClaiming 
}: { 
  poolId: bigint; 
  address: Address;
  formatDonut: (val: bigint) => string;
  onClaim: (poolId: bigint) => void;
  isClaiming: boolean;
}) {
  const { data: rewardData } = useReadContract({
    address: DONUETTES_COMINING_ADDRESS,
    abi: DONUETTES_COMINING_ABI,
    functionName: 'getClaimableRewards',
    args: [poolId, address],
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  const donutReward = rewardData ? (rewardData as any)[0] : 0n;
  const donuetteReward = rewardData ? (rewardData as any)[1] : 0n;
  const canClaim = rewardData ? (rewardData as any)[2] : false;

  if (!canClaim && donutReward === 0n && donuetteReward === 0n) {
    return null;
  }

  return (
    <motion.div
      className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all hover:shadow-md border border-amber-100"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02, x: 5 }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-200 rounded-lg">
          <span className="text-lg">🏆</span>
        </div>
        <div>
          <div className="font-bold text-amber-900">
            Pool #{poolId.toString()}
          </div>
          {canClaim && (
            <div className="text-xs text-amber-600">
              {formatDonut(donutReward)} DONUT + {donuetteReward.toString()} Donuettes
            </div>
          )}
        </div>
      </div>
      {canClaim && (
        <motion.button
          onClick={() => onClaim(poolId)}
          disabled={isClaiming}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm font-bold"
          whileHover={!isClaiming ? { scale: 1.05 } : {}}
          whileTap={!isClaiming ? { scale: 0.95 } : {}}
        >
          {isClaiming ? 'Claiming...' : 'Claim'}
        </motion.button>
      )}
    </motion.div>
  );
}

export function PastPools({ formatDonut, isExpanded, onToggle }: PastPoolsProps) {
  const [userPools, setUserPools] = useState<bigint[]>([]);
  const { address } = useAccount();
  const { writeContract, isPending: isClaiming } = useWriteContract();

  // Get user's pool IDs - always fetch, not just when expanded
  const { data: poolIds } = useReadContract({
    address: DONUETTES_COMINING_ADDRESS,
    abi: DONUETTES_COMINING_ABI,
    functionName: 'getUserPools',
    args: address ? [address as Address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });

  useEffect(() => {
    if (poolIds && Array.isArray(poolIds)) {
      const pools = poolIds as bigint[];
      setUserPools(pools);
      console.log('User pools:', pools.map(p => p.toString()));
    } else if (poolIds === null || poolIds === undefined) {
      setUserPools([]);
    }
  }, [poolIds]);

  // Get current pool ID to filter it out
  const { data: currentPoolId } = useReadContract({
    address: DONUETTES_COMINING_ADDRESS,
    abi: DONUETTES_COMINING_ABI,
    functionName: 'currentPoolId',
  });

  // Filter out current pool - show all pools that are not the current one
  const pastPools = userPools.filter((poolId) => {
    if (currentPoolId === undefined || currentPoolId === null) return false;
    return poolId !== currentPoolId && poolId < currentPoolId;
  });

  // Debug logging
  useEffect(() => {
    if (currentPoolId !== undefined) {
      console.log('Current pool ID:', currentPoolId?.toString());
      console.log('User pools:', userPools.map(p => p.toString()));
      console.log('Past pools:', pastPools.map(p => p.toString()));
    }
  }, [currentPoolId, userPools, pastPools]);

  const handleClaim = (poolId: bigint) => {
    if (!address) return;

    writeContract({
      address: DONUETTES_COMINING_ADDRESS,
      abi: DONUETTES_COMINING_ABI,
      functionName: 'claimRewards',
      args: [poolId],
    });
  };

  // Always show the component if user is connected, even if no past pools yet
  if (!address) return null;

  return (
    <motion.div
      className="mt-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <motion.button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all group"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Trophy className="w-5 h-5 text-white" />
          </motion.div>
          <div className="text-left">
            <h3 className="text-amber-900 font-bold">Past Pools</h3>
            <p className="text-xs text-amber-600">
              {pastPools.length} pool{pastPools.length !== 1 ? 's' : ''} participated
            </p>
          </div>
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
            className="px-6 pb-6 border-t border-amber-100"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {pastPools.length === 0 ? (
              <div className="py-8 text-center text-amber-600">
                <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No past pools yet</p>
                <p className="text-xs mt-1">Your completed pools will appear here</p>
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {pastPools.map((poolId, index) => (
                  <PoolRewardItem
                    key={poolId.toString()}
                    poolId={poolId}
                    address={address as Address}
                    formatDonut={formatDonut}
                    onClaim={handleClaim}
                    isClaiming={isClaiming}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

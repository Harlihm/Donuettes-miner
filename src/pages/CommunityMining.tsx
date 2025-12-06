import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Pickaxe, Timer, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { COMINING_ABI, COMINING_ADDRESS } from "./constant";
// ABI for Comining Contract
const POOL_ABI = COMINING_ABI;

const POOL_ADDRESS = COMINING_ADDRESS;

export function CommunityMining() {
  const [amount, setAmount] = useState("");
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  // 1. Get Current Pool ID
  const { data: currentPoolId } = useReadContract({
    address: POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: "currentPoolId",
    query: {
      refetchInterval: 5000,
    },
  });

  // 2. Get Pool Details
  const { data: poolDetails } = useReadContract({
    address: POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: "getPoolDetails",
    args: currentPoolId ? [currentPoolId] : undefined,
    query: {
      enabled: !!currentPoolId,
      refetchInterval: 2000,
    },
  });

  // 3. Get Current Glaze Price
  const { data: currentPrice } = useReadContract({
    address: POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: "getCurrentGlazePrice",
    query: {
      refetchInterval: 2000,
    },
  });

  // 4. Get User Position
  const { data: userPosition } = useReadContract({
    address: POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: "getCurrentPoolPosition",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  // 5. Get Min Deposit
  const { data: minDeposit } = useReadContract({
    address: POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: "minDeposit",
  });

  // Derived State
  const totalDeposited = poolDetails ? (poolDetails as any)[0] : 0n;
  const totalShares = poolDetails ? (poolDetails as any)[1] : 0n;
  const participants = poolDetails ? (poolDetails as any)[5] : 0n;
  const price = currentPrice ? (currentPrice as bigint) : 0n;
  const userDeposited = userPosition ? (userPosition as any)[1] : 0n;
  const minDepositAmount = minDeposit ? (minDeposit as bigint) : 0n;

  // Calculate progress: (Deposited / Price) * 100
  // If price is 0 (expired), progress is 0
  const progress =
    price > 0n ? Number((totalDeposited * 10000n) / price) / 100 : 0;
  const isReadyToMine = totalDeposited >= price && price > 0n;

  const handleDeposit = () => {
    if (!amount) return;
    writeContract({
      address: POOL_ADDRESS,
      abi: POOL_ABI,
      functionName: "deposit",
      value: parseEther(amount),
    });
  };

  const handleWithdraw = () => {
    if (!amount || totalDeposited === 0n) return;
    const amountWei = parseEther(amount);
    // Calculate shares to withdraw: (amount * totalShares) / totalDeposited
    const sharesToWithdraw = (amountWei * totalShares) / totalDeposited;

    writeContract({
      address: POOL_ADDRESS,
      abi: POOL_ABI,
      functionName: "withdrawFromCurrentPool",
      args: [sharesToWithdraw],
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <span className="text-2xl">🍩</span>
          Co-miners Pool #{currentPoolId?.toString() || "-"}
        </h2>
        <p className="text-sm opacity-80">
          Pool funds together to win the King Glazer auction.
        </p>
      </motion.div>

      <Card className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-bold">Status</span>
          <span
            className={`px-2 py-1 rounded text-xs font-bold border ${
              isReadyToMine
                ? "bg-green-400/20 text-green-700 border-green-700"
                : "bg-yellow-400/20 text-yellow-700 border-yellow-700"
            }`}
          >
            {isReadyToMine ? "READY TO MINE" : "ACCUMULATING"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Progress to Mine</span>
            <span className="font-bold">{progress.toFixed(2)}%</span>
          </div>
          <div className="h-4 bg-black/5 rounded-full overflow-hidden border border-black/10 relative">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
            {/* Target Line */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/50 right-0 z-10" />
          </div>
          <div className="flex justify-between text-xs opacity-60">
            <span>{formatEther(totalDeposited)} ETH raised</span>
            <span className="flex items-center gap-1">
              Target: {formatEther(price)} ETH
              <TrendingDown className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background/50 p-3 rounded-lg border border-foreground/10">
            <div className="text-xs opacity-60">Total Deposited</div>
            <div className="font-bold text-lg">
              {Number(formatEther(totalDeposited)).toFixed(4)} ETH
            </div>
          </div>
          <div className="bg-background/50 p-3 rounded-lg border border-foreground/10">
            <div className="text-xs opacity-60">Participants</div>
            <div className="font-bold text-lg">{participants.toString()}</div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Deposit ETH</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.01"
              className="flex-1 bg-white p-2 rounded-lg border-2 border-foreground focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <Button onClick={handleDeposit} disabled={isPending}>
              {isPending ? "Depositing..." : "Deposit"}
            </Button>
            {userDeposited > 0n && (
              <Button
                onClick={handleWithdraw}
                disabled={isPending}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                Withdraw
              </Button>
            )}
          </div>
          <p className="text-xs opacity-60">
            Min deposit:{" "}
            {minDepositAmount > 0n ? formatEther(minDepositAmount) : "0.01"} ETH
          </p>
        </div>
      </Card>

      <Card className="bg-[#feface]/50">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Pickaxe className="w-4 h-4" />
          Your Position
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Your Deposit</span>
            <span className="font-bold">
              {userPosition ? formatEther(userPosition[1]) : "0.00"} ETH
            </span>
          </div>
          <div className="flex justify-between">
            <span>Pool Share</span>
            <span className="font-bold">
              {userPosition
                ? (Number(userPosition[3]) / 100).toFixed(2)
                : "0.00"}
              %
            </span>
          </div>

          {/* Note: Claimable amounts would need to be fetched from getClaimableRewards for past pools */}

          <Button variant="outline" className="w-full mt-2" disabled>
            View Past Rewards
          </Button>
        </div>
      </Card>

      <div className="bg-white/50 p-4 rounded-xl text-xs space-y-2 border border-foreground/10">
        <h4 className="font-bold flex items-center gap-2">
          <Timer className="w-3 h-3" />
          How it works
        </h4>
        <p>1. Deposit ETH into the active pool.</p>
        <p>2. The target price drops over time (Dutch Auction).</p>
        <p>3. When Pool Funds ≥ Target Price, the pool automatically mines.</p>
        <p>
          4. If the pool wins, you get DONUTs. If outbid, you get ETH profit.
        </p>
      </div>
    </div>
  );
}

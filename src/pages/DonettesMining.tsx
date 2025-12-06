import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Gem, Zap, TrendingDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther, Address, maxUint256 } from "viem";
import {
  DonuetteMinerABI,
  DonuetteMinerAddress,
  DONUT_TOKEN_ABI,
} from "./constant";
import { useEffect } from "react";

export function DonettesMining() {
  const { address } = useAccount();
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Read Miner Data
  const { data: donutAddress } = useReadContract({
    address: DonuetteMinerAddress,
    abi: DonuetteMinerABI,
    functionName: "donut",
  });

  const { data: currentPrice, refetch: refetchPrice } = useReadContract({
    address: DonuetteMinerAddress,
    abi: DonuetteMinerABI,
    functionName: "getPrice",
  });

  const { data: dps } = useReadContract({
    address: DonuetteMinerAddress,
    abi: DonuetteMinerABI,
    functionName: "getDps",
  });

  const { data: slot0, refetch: refetchSlot0 } = useReadContract({
    address: DonuetteMinerAddress,
    abi: DonuetteMinerABI,
    functionName: "getSlot0",
  });

  // Read Allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: donutAddress as Address,
    abi: DONUT_TOKEN_ABI,
    functionName: "allowance",
    args: address && donutAddress ? [address, DonuetteMinerAddress] : undefined,
    query: {
      enabled: !!address && !!donutAddress,
    },
  });

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refetchPrice();
      refetchSlot0();
      refetchAllowance();
    }, 2000);
    return () => clearInterval(interval);
  }, [refetchPrice, refetchSlot0, refetchAllowance]);

  // Refetch on transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      refetchAllowance();
      refetchPrice();
      refetchSlot0();
    }
  }, [isConfirmed, refetchAllowance, refetchPrice, refetchSlot0]);

  const isApproveNeeded =
    currentPrice && allowance !== undefined && allowance < currentPrice;

  const handleMine = () => {
    if (!currentPrice || !donutAddress) return;

    if (isApproveNeeded) {
      writeContract({
        address: donutAddress as Address,
        abi: DONUT_TOKEN_ABI,
        functionName: "approve",
        args: [DonuetteMinerAddress, maxUint256],
      });
    } else {
      writeContract({
        address: DonuetteMinerAddress,
        abi: DonuetteMinerABI,
        functionName: "mine",
        args: [
          address!, // miner
          "0x0000000000000000000000000000000000000000", // provider
          BigInt(slot0?.epochId || 0), // epochId
          BigInt(Math.floor(Date.now() / 1000) + 3600), // deadline
          parseEther("1000000"), // maxPrice (slippage protection)
          "", // uri
        ],
      });
    }
  };

  const formatDonut = (val: bigint | undefined) => {
    if (!val) return "0.00";
    return parseFloat(formatEther(val)).toFixed(2);
  };

  const nextPrice = currentPrice ? currentPrice * 2n : 0n;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2 text-purple-700">
          <Gem className="w-6 h-6" />
          Mine Donettes
        </h2>
        <p className="text-sm opacity-80">
          Spend DONUT to mine Donettes tokens.
        </p>
      </motion.div>

      <Card className="space-y-6 border-purple-900 shadow-[4px_4px_0px_0px_rgba(88,28,135,1)]">
        <div className="text-center space-y-1">
          <div className="text-sm opacity-60">Current Mining Price</div>
          <div className="text-4xl font-black text-purple-900">
            {formatDonut(currentPrice)} DONUT
          </div>
          <div className="text-xs text-red-500 flex items-center justify-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Dropping every second
          </div>
        </div>

        <Button
          onClick={handleMine}
          disabled={isPending || isConfirming || !currentPrice}
          className="w-full py-4 text-lg bg-purple-400 hover:bg-purple-500 border-purple-900 shadow-[2px_2px_0px_0px_rgba(88,28,135,1)]"
        >
          {isPending || isConfirming ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isPending ? "Confirming..." : "Processing..."}
            </span>
          ) : isApproveNeeded ? (
            "Approve DONUT"
          ) : (
            "Mine Now"
          )}
        </Button>

        {writeError && (
          <div className="text-xs text-red-500 text-center">
            {writeError.message.split("\n")[0]}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-purple-100 p-3 rounded-lg border border-purple-200">
            <div className="opacity-60 text-xs">Next Price (Approx)</div>
            <div className="font-bold">{formatDonut(nextPrice)} DONUT</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg border border-purple-200">
            <div className="opacity-60 text-xs">Emission Rate</div>
            <div className="font-bold">{formatDonut(dps)} DNTE/sec</div>
          </div>
        </div>
      </Card>

      <div className="bg-white/50 p-4 rounded-xl text-xs space-y-2 border border-foreground/10">
        <h4 className="font-bold flex items-center gap-2 text-purple-900">
          <Zap className="w-3 h-3" />
          Donette Mechanics
        </h4>
        <p>• Price drops over time (Dutch Auction).</p>
        <p>• Mining doubles the price for the next miner.</p>
        <p>• 80% of DONUT spent goes to the previous miner.</p>
        <p>• 10% to Treasury, 10% to Provider.</p>
      </div>
    </div>
  );
}

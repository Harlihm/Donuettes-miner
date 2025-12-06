import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Gem, Zap, TrendingDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  useAccount,
  useReadContract,
  useSendCalls,
  useCallsStatus,
} from "wagmi";
import { formatEther, Address, encodeFunctionData } from "viem";
import {
  DonuetteMinerABI,
  DonuetteMinerAddress,
  DONUT_TOKEN_ABI,
} from "./constant";
import { useEffect } from "react";

export function DonettesMining() {
  const { address } = useAccount();
  const {
    sendCalls,
    data: callsId,
    isPending,
    error: sendError,
  } = useSendCalls();

  const { data: callsStatus } = useCallsStatus({
    id: callsId?.id as string,
    query: {
      enabled: !!callsId,
      refetchInterval: (data) =>
        data.state.status === "success" && data.state.data?.status === "success"
          ? false
          : 1000,
    },
  });

  const isConfirming = callsStatus?.status === "pending";
  const isConfirmed = callsStatus?.status === "success";

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

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refetchPrice();
      refetchSlot0();
    }, 2000);
    return () => clearInterval(interval);
  }, [refetchPrice, refetchSlot0]);

  // Refetch on transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      refetchPrice();
      refetchSlot0();
    }
  }, [isConfirmed, refetchPrice, refetchSlot0]);

  const handleMine = () => {
    if (!currentPrice || !donutAddress || !address) return;

    // Batch approve + mine into a single transaction
    sendCalls({
      calls: [
        {
          to: donutAddress as Address,
          data: encodeFunctionData({
            abi: DONUT_TOKEN_ABI,
            functionName: "approve",
            args: [DonuetteMinerAddress, currentPrice],
          }),
        },
        {
          to: DonuetteMinerAddress,
          data: encodeFunctionData({
            abi: DonuetteMinerABI,
            functionName: "mine",
            args: [
              address,
              "0x0000000000000000000000000000000000000000", // provider
              BigInt(slot0?.epochId || 0),
              BigInt(Math.floor(Date.now() / 1000) + 3600), // deadline
              currentPrice * 2n, // maxPrice (allow some slippage)
              "",
            ],
          }),
        },
      ],
    });
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
          disabled={isPending || isConfirming || !currentPrice || !address}
          className="w-full py-4 text-lg bg-purple-400 hover:bg-purple-500 border-purple-900 shadow-[2px_2px_0px_0px_rgba(88,28,135,1)]"
        >
          {isPending || isConfirming ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isPending ? "Confirming..." : "Processing..."}
            </span>
          ) : (
            "Mine Now"
          )}
        </Button>

        {sendError && (
          <div className="text-xs text-red-500 text-center">
            {sendError.message.split("\n")[0]}
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

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Gem, Zap, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";

// Placeholder ABIs
const MINER_ABI = [
  {
    inputs: [
      { name: "miner", type: "address" },
      { name: "provider", type: "address" },
      { name: "epochId", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "maxPrice", type: "uint256" },
      { name: "uri", type: "string" },
    ],
    name: "mine",
    outputs: [{ name: "price", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const MINER_ADDRESS = "0x0000000000000000000000000000000000000000";

export function DonettesMining() {
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  // Mock data
  const stats = {
    currentPrice: "5.24 DONUT",
    nextPrice: "10.48 DONUT",
    dps: "4.00 DNTE/sec",
    halving: "29d 12h",
  };

  const handleMine = () => {
    // 1. Approve DONUT (In real app, check allowance first)
    // 2. Call mine()

    // For demo, we just show the mine call structure
    writeContract({
      address: MINER_ADDRESS,
      abi: MINER_ABI,
      functionName: "mine",
      args: [
        address!, // miner
        "0x0000000000000000000000000000000000000000", // provider
        0n, // epochId (fetch from contract)
        BigInt(Math.floor(Date.now() / 1000) + 3600), // deadline
        parseEther("100"), // maxPrice
        "", // uri
      ],
    });
  };

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
            {stats.currentPrice}
          </div>
          <div className="text-xs text-red-500 flex items-center justify-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Dropping every second
          </div>
        </div>

        <Button
          onClick={handleMine}
          disabled={isPending}
          className="w-full py-4 text-lg bg-purple-400 hover:bg-purple-500 border-purple-900 shadow-[2px_2px_0px_0px_rgba(88,28,135,1)]"
        >
          {isPending ? "Mining..." : "Mine Now"}
        </Button>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-purple-100 p-3 rounded-lg border border-purple-200">
            <div className="opacity-60 text-xs">Next Price</div>
            <div className="font-bold">{stats.nextPrice}</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg border border-purple-200">
            <div className="opacity-60 text-xs">Emission Rate</div>
            <div className="font-bold">{stats.dps}</div>
          </div>
        </div>
      </Card>

      <div className="bg-white/50 p-4 rounded-xl text-xs space-y-2 border border-foreground/10">
        <h4 className="font-bold flex items-center gap-2 text-purple-900">
          <Zap className="w-3 h-3" />
          Donette Mechanics
        </h4>
        <p>• Starting Price: 5 DONUT</p>
        <p>• Price drops over time (Dutch Auction).</p>
        <p>• Mining doubles the price for the next miner.</p>
        <p>• 80% of DONUT spent goes to the previous miner.</p>
      </div>
    </div>
  );
}

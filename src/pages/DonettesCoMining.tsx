import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Pickaxe, Timer, TrendingDown, Gem } from "lucide-react";
import { motion } from "framer-motion";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useSendCalls,
  useCallsStatus,
} from "wagmi";
import { parseEther, formatEther, Address, encodeFunctionData } from "viem";
import { usePublicClient, useWaitForTransactionReceipt } from "wagmi";
import {
  DONUETTES_COMINING_ABI,
  DONUETTES_COMINING_ADDRESS,
  DONUT_TOKEN_ABI,
} from "./constant";

// ABI for Donuettes Comining Contract
const POOL_ABI = DONUETTES_COMINING_ABI;

const POOL_ADDRESS = DONUETTES_COMINING_ADDRESS;

export function DonettesCoMining() {
  const [amount, setAmount] = useState("");
  const [approveTxHash, setApproveTxHash] = useState<string | null>(null);
  const { address, connector } = useAccount();
  
  // Check if wallet supports sendCalls (EIP-5792) - primarily Farcaster
  const isFarcasterWallet = connector?.id === "farcaster" || connector?.id === "farcasterMiniApp";
  
  const { writeContract, writeContractAsync, isPending: isWritePending, error: writeError, data: writeTxHash } = useWriteContract();
  const isWithdrawPending = isWritePending;
  const isDepositWritePending = isWritePending && !approveTxHash;
  
  // Track approval transaction hash from writeContract
  useEffect(() => {
    if (writeTxHash && approveTxHash === null && !isFarcasterWallet) {
      // Check if this is an approve transaction by checking if we're waiting for approval
      const isApproveTx = writeTxHash && amount;
      if (isApproveTx) {
        setApproveTxHash(writeTxHash);
      }
    }
  }, [writeTxHash, approveTxHash, isFarcasterWallet, amount]);
  
  const {
    sendCalls,
    data: callsId,
    isPending: isDepositPending,
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

  // 6. Get DONUT token address
  const { data: donutAddress } = useReadContract({
    address: POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: "donut",
  });

  // 7. Get User DONUT Balance
  const { data: donutBalance } = useReadContract({
    address: donutAddress as Address,
    abi: DONUT_TOKEN_ABI,
    functionName: "balanceOf",
    args: [address as Address],
    query: {
      enabled: !!address && !!donutAddress,
    },
  });

  // 8. Get Current Allowance
  const { data: currentAllowance } = useReadContract({
    address: donutAddress as Address,
    abi: DONUT_TOKEN_ABI,
    functionName: "allowance",
    args: [address as Address, POOL_ADDRESS],
    query: {
      enabled: !!address && !!donutAddress,
    },
  });

  const publicClient = usePublicClient();
  
  // Wait for approval transaction
  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveTxHash as `0x${string}` | undefined,
    query: {
      enabled: !!approveTxHash,
    },
  });

  // Auto-deposit after approval succeeds
  useEffect(() => {
    if (isApproveSuccess && approveTxHash && amount && !isFarcasterWallet) {
      const depositAmount = parseEther(amount);
      console.log("Approval confirmed, proceeding with deposit");
      setApproveTxHash(null);
      writeContract({
        address: POOL_ADDRESS,
        abi: POOL_ABI,
        functionName: "deposit",
        args: [depositAmount],
      });
    }
  }, [isApproveSuccess, approveTxHash, amount, isFarcasterWallet, writeContract]);

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

  const amountWei = amount ? parseEther(amount) : 0n;
  const hasInsufficientBalance =
    !donutBalance || donutBalance < amountWei || amountWei === 0n;
  const isDepositDisabled =
    isDepositPending || isConfirming || isDepositWritePending || isApproving || hasInsufficientBalance || !amount || !!approveTxHash;

  const handleDeposit = async () => {
    if (!amount || !donutAddress || !address || !publicClient) {
      console.error("Missing required data:", { amount, donutAddress, address, publicClient });
      return;
    }

    try {
      const depositAmount = parseEther(amount);
      console.log("Initiating deposit:", {
        amount,
        depositAmount: depositAmount.toString(),
        donutAddress,
        poolAddress: POOL_ADDRESS,
        isFarcasterWallet,
        currentAllowance: currentAllowance?.toString(),
      });

      // For Farcaster wallets, use sendCalls (batch transactions)
      if (isFarcasterWallet) {
        sendCalls({
          calls: [
            {
              to: donutAddress as Address,
              data: encodeFunctionData({
                abi: DONUT_TOKEN_ABI,
                functionName: "approve",
                args: [POOL_ADDRESS, depositAmount],
              }),
            },
            {
              to: POOL_ADDRESS,
              data: encodeFunctionData({
                abi: POOL_ABI,
                functionName: "deposit",
                args: [depositAmount],
              }),
            },
          ],
        });
      } else {
        // For regular wallets, check allowance and approve if needed, then deposit
        const needsApproval = !currentAllowance || currentAllowance < depositAmount;
        
        if (needsApproval) {
          console.log("Approving token spend...");
          if (writeContractAsync) {
            try {
              const approveHash = await writeContractAsync({
              address: donutAddress as Address,
              abi: DONUT_TOKEN_ABI,
              functionName: "approve",
              args: [POOL_ADDRESS, depositAmount],
            });
            setApproveTxHash(approveHash);
            console.log("Waiting for approval transaction:", approveHash);
            // Deposit will be triggered automatically by useEffect when approval succeeds
            } catch (error) {
              console.error("Approve error:", error);
            }
          } else {
            // Fallback: use writeContract with mutation
            writeContract({
              address: donutAddress as Address,
              abi: DONUT_TOKEN_ABI,
              functionName: "approve",
              args: [POOL_ADDRESS, depositAmount],
            });
          }
        } else {
          // Already approved, deposit directly
          writeContract({
            address: POOL_ADDRESS,
            abi: POOL_ABI,
            functionName: "deposit",
            args: [depositAmount],
          });
        }
      }
    } catch (error) {
      console.error("Error in handleDeposit:", error);
      setApproveTxHash(null);
    }
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

  const formatDonut = (val: bigint | undefined) => {
    if (!val) return "0.00";
    return parseFloat(formatEther(val)).toFixed(2);
  };

  // Reset amount and refetch data after successful deposit
  useEffect(() => {
    if (isConfirmed) {
      setAmount("");
      // Data will auto-refetch due to refetchInterval in useReadContract hooks
    }
  }, [isConfirmed]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Gem className="w-6 h-6" />
          <span className="text-2xl"> </span>
          Donuettes Co-miners Pool #{currentPoolId?.toString() || "-"}
        </h2>
        <p className="text-sm opacity-80">
          Pool DONUT together to win the Donuette King auction.
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
            <span>{formatDonut(totalDeposited)} DONUT raised</span>
            <span className="flex items-center gap-1">
              Target: {formatDonut(price)} DONUT
              <TrendingDown className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background/50 p-3 rounded-lg border border-foreground/10">
            <div className="text-xs opacity-60">Total Deposited</div>
            <div className="font-bold text-lg">
              {formatDonut(totalDeposited)} DONUT
            </div>
          </div>
          <div className="bg-background/50 p-3 rounded-lg border border-foreground/10">
            <div className="text-xs opacity-60">Participants</div>
            <div className="font-bold text-lg">{participants.toString()}</div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Deposit DONUT</label>
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="flex-1 min-w-0 bg-white p-2 rounded-lg border-2 border-foreground focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <div className="flex gap-2 flex-shrink-0">
              <Button
                onClick={handleDeposit}
                disabled={isDepositDisabled}
                className="whitespace-nowrap"
              >
                {approveTxHash || isApproving
                  ? "Approving..."
                  : isDepositPending || isConfirming || isDepositWritePending
                    ? "Depositing..."
                    : isConfirmed
                      ? "Deposited!"
                      : "Deposit"}
              </Button>
              {userDeposited > 0n && (
                <Button
                  onClick={handleWithdraw}
                  disabled={isWithdrawPending}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50 whitespace-nowrap"
                >
                  {isWithdrawPending ? "Withdrawing..." : "Withdraw"}
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs opacity-60">
            Min deposit:{" "}
            {minDepositAmount > 0n ? formatDonut(minDepositAmount) : "5"}{" "}
            DONUT
          </p>
          {hasInsufficientBalance && amount && (
            <p className="text-xs text-red-500">
              Insufficient DONUT balance. You have: {formatDonut(donutBalance)}{" "}
              DONUT
            </p>
          )}
          {(sendError || writeError) && (
            <p className="text-xs text-red-500">
              Error: {(sendError || writeError)?.message || "Transaction failed"}
            </p>
          )}
          {approveTxHash && (
            <p className="text-xs text-yellow-600">
              Waiting for approval confirmation...
            </p>
          )}
          {isConfirmed && (
            <p className="text-xs text-green-500">
              Deposit successful! Refreshing...
            </p>
          )}
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
              {userPosition ? formatDonut(userPosition[1]) : "0.00"} DONUT
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
        <p>1. Deposit DONUT into the active pool.</p>
        <p>2. The target price drops over time (Dutch Auction).</p>
        <p>3. When Pool Funds ≥ Target Price, the pool automatically mines.</p>
        <p>
          4. If the pool wins, you get Donuettes. If outbid, you get DONUT
          profit.
        </p>
      </div>
    </div>
  );
}

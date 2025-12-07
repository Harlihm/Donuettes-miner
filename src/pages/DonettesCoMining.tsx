import { useState, useEffect } from "react";
import { Gem } from "lucide-react";
import { motion } from "framer-motion";
import { PoolStats } from "../components/PoolStats";
import { DepositWithdraw } from "../components/DepositWithdraw";
import { YourPosition } from "../components/YourPosition";
import { HowItWorks } from "../components/HowItWorks";
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

  // Calculate pool share percentage
  const poolShare = totalDeposited > 0n && userDeposited > 0n
    ? Number((userDeposited * 10000n) / totalDeposited) / 100
    : 0;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
      {/* Pool Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white border border-white/30">
              Pool #{currentPoolId?.toString() || "-"}
            </div>
          </div>
          <motion.h3
            className="text-white mb-2 text-2xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.span
              className="inline-block mr-2"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Gem className="w-6 h-6 inline" />
            </motion.span>
            Donuettes Co-miners Pool
          </motion.h3>
          <motion.p
            className="text-white/90 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.2 }}
          >
            🏆 Pool DONUT together to win the Donuette King auction
          </motion.p>
        </div>
      </div>

      <div className="p-8">
        {/* Pool Stats */}
        <PoolStats 
          progress={progress}
          totalDeposited={totalDeposited}
          targetAmount={price}
          participants={participants}
          isReadyToMine={isReadyToMine}
          formatDonut={formatDonut}
        />

        {/* Deposit/Withdraw */}
        <DepositWithdraw
          connectedWallet={address || null}
          amount={amount}
          setAmount={setAmount}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          minDeposit={minDepositAmount}
          formatDonut={formatDonut}
          isDepositDisabled={isDepositDisabled}
          isWithdrawPending={isWithdrawPending}
          isDepositPending={isDepositPending || isConfirming || isDepositWritePending}
          isApproving={isApproving}
          approveTxHash={approveTxHash}
          isConfirmed={isConfirmed}
          hasInsufficientBalance={hasInsufficientBalance}
          donutBalance={donutBalance}
          userDeposited={userDeposited}
          sendError={sendError}
          writeError={writeError}
        />

        {/* Your Position */}
        <YourPosition
          userDeposit={userDeposited}
          poolShare={poolShare}
          formatDonut={formatDonut}
        />
      </div>

      {/* How It Works */}
      <HowItWorks />
    </div>
  );
}

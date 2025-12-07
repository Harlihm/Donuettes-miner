import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DepositWithdrawProps {
  connectedWallet: string | null;
  amount: string;
  setAmount: (amount: string) => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  minDeposit: bigint;
  formatDonut: (val: bigint) => string;
  isDepositDisabled: boolean;
  isWithdrawPending: boolean;
  isDepositPending: boolean;
  isApproving: boolean;
  approveTxHash: string | null;
  isConfirmed: boolean;
  hasInsufficientBalance: boolean;
  donutBalance: bigint | undefined;
  userDeposited: bigint;
  sendError: Error | null;
  writeError: Error | null;
}

export function DepositWithdraw({
  connectedWallet,
  amount,
  setAmount,
  onDeposit,
  onWithdraw,
  minDeposit,
  formatDonut,
  isDepositDisabled,
  isWithdrawPending,
  isDepositPending,
  isApproving,
  approveTxHash,
  isConfirmed,
  hasInsufficientBalance,
  donutBalance,
  userDeposited,
  sendError,
  writeError,
}: DepositWithdrawProps) {
  const minDepositAmount = formatDonut(minDeposit);
  const quickAmounts = [5, 10, 25, 50];

  return (
    <motion.div
      className="relative mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-orange-200 rounded-3xl blur opacity-30" />
      <div className="relative bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-amber-200/50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <label className="text-amber-900 flex items-center gap-2">
            💰 Deposit DONUT
          </label>
          <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 rounded-full">
            <Info className="w-3 h-3 text-amber-600" />
            <span className="text-xs text-amber-700">Min: {minDepositAmount} DONUT</span>
          </div>
        </div>

        <div className="relative mb-4">
          <motion.input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min={minDepositAmount}
            className="w-full px-6 py-4 text-xl border-2 border-amber-300 rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200 bg-white shadow-inner transition-all"
            placeholder={minDepositAmount}
            whileFocus={{ scale: 1.02, borderColor: '#f59e0b' }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-amber-600">
            DONUT
          </div>
        </div>

        {/* Quick amount buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {quickAmounts.map((quickAmount) => (
            <motion.button
              key={quickAmount}
              onClick={() => setAmount(quickAmount.toFixed(2))}
              className="px-3 py-2 bg-white border-2 border-amber-200 rounded-xl text-sm text-amber-700 hover:border-amber-400 hover:bg-amber-50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {quickAmount}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={onDeposit}
            disabled={isDepositDisabled}
            className="group relative flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl overflow-hidden"
            whileHover={!isDepositDisabled ? { scale: 1.05 } : {}}
            whileTap={!isDepositDisabled ? { scale: 0.95 } : {}}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            <AnimatePresence mode="wait">
              {approveTxHash || isApproving ? (
                <motion.span
                  key="approving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 relative z-10"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Approving...
                </motion.span>
              ) : isDepositPending ? (
                <motion.span
                  key="depositing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 relative z-10"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Depositing...
                </motion.span>
              ) : isConfirmed ? (
                <motion.span
                  key="deposited"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative z-10"
                >
                  ✅ Deposited!
                </motion.span>
              ) : (
                <motion.span
                  key="deposit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 flex items-center gap-2"
                >
                  <ArrowDownToLine className="w-5 h-5" />
                  Deposit
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          {userDeposited > 0n && (
            <motion.button
              onClick={onWithdraw}
              disabled={isWithdrawPending}
              className="group flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-amber-300 text-amber-700 rounded-2xl hover:bg-amber-50 hover:border-amber-400 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 shadow-md hover:shadow-lg"
              whileHover={!isWithdrawPending ? { scale: 1.05 } : {}}
              whileTap={!isWithdrawPending ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {isWithdrawPending ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full"
                  />
                  Withdrawing...
                </span>
              ) : (
                <>
                  <ArrowUpFromLine className="w-5 h-5" />
                  Withdraw
                </>
              )}
            </motion.button>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs opacity-60">
            Min deposit: {minDepositAmount} DONUT
          </p>
          <AnimatePresence>
            {hasInsufficientBalance && amount && (
              <motion.p
                className="text-xs text-red-500"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                ⚠️ Insufficient DONUT balance. You have: {formatDonut(donutBalance || 0n)} DONUT
              </motion.p>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {(sendError || writeError) && (
              <motion.p
                className="text-xs text-red-500"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                ❌ Error: {(sendError || writeError)?.message || 'Transaction failed'}
              </motion.p>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {approveTxHash && (
              <motion.p
                className="text-xs text-yellow-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ⏳ Waiting for approval confirmation...
                </motion.span>
              </motion.p>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isConfirmed && (
              <motion.p
                className="text-xs text-green-500"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                ✅ Deposit successful! Refreshing...
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

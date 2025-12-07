import { motion } from "framer-motion";

interface NavigationProps {
  activeTab: "donettes" | "donettes-comining";
  onTabChange: (tab: "donettes" | "donettes-comining") => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <motion.div
      className="flex gap-3 justify-center mb-8 flex-wrap"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex-1 min-w-[200px]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.button
          onClick={() => onTabChange("donettes-comining")}
          className={`w-full relative group flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-all shadow-lg overflow-hidden ${
            activeTab === "donettes-comining"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
              : "bg-white/80 backdrop-blur-sm border-2 border-amber-200 text-amber-700 hover:border-amber-300"
          }`}
          whileHover={activeTab === "donettes-comining" ? {} : { scale: 1.02 }}
        >
          {activeTab === "donettes-comining" && (
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "linear",
              }}
            />
          )}
          <motion.span
            className="text-2xl relative z-10"
            animate={
              activeTab === "donettes-comining"
                ? { rotate: [0, -15, 15, 0] }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            ⛏️
          </motion.span>
          <span className="relative z-10 font-bold text-sm">
            Donuettes Co-mining
          </span>
        </motion.button>
      </motion.div>
      <motion.div
        className="flex-1 min-w-[200px]"
        style={{ display: "none" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.button
          onClick={() => onTabChange("donettes")}
          className={`w-full relative group flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-all shadow-lg overflow-hidden ${
            activeTab === "donettes"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
              : "bg-white/80 backdrop-blur-sm border-2 border-amber-200 text-amber-700 hover:border-amber-300"
          }`}
          whileHover={activeTab === "donettes" ? {} : { scale: 1.02 }}
        >
          {activeTab === "donettes" && (
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "linear",
              }}
            />
          )}
          <motion.span
            className="text-2xl relative z-10"
            animate={
              activeTab === "donettes"
                ? { rotate: [0, -15, 15, 0] }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            ⛏️
          </motion.span>
          <span className="relative z-10 font-bold text-sm">
            Donettes Mining
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

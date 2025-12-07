import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Navigation } from "./components/Navigation";
import { DonettesMining } from "./pages/DonettesMining";
import { DonettesCoMining } from "./pages/DonettesCoMining";
import { Button } from "./components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [isMaintenanceMode] = useState(true); // Set to false to disable maintenance mode
  const [activeTab, setActiveTab] = useState<
    "donettes" | "donettes-comining"
  >("donettes-comining");
  const [hasPromptedAdd, setHasPromptedAdd] = useState(false);
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    sdk.actions.ready();

    if (!isConnected && connectors.length > 0) {
      const connector =
        connectors.find((c) => c.id === "farcaster") || connectors[0];
      if (connector) {
        connect({ connector });
      }
    }
  }, [isConnected, connect, connectors]);

  useEffect(() => {
    const promptAddMiniApp = async () => {
      if (hasPromptedAdd) return;

      try {
        const context = await sdk.context;
        if (!context.client.added) {
          await sdk.actions.addMiniApp();
          setHasPromptedAdd(true);
        }
      } catch (error) {
        console.log("User declined to add mini app");
        setHasPromptedAdd(true);
      }
    };

    promptAddMiniApp();
  }, [hasPromptedAdd]);

  // Maintenance mode - blocks all access
  if (isMaintenanceMode) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-pink-100 via-amber-50 to-orange-100 relative overflow-hidden flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="relative z-10 text-center px-6 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mb-8"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="text-8xl">🔧</div>
          </motion.div>
          
          <motion.h1
            className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-amber-600 to-orange-600 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Please Wait
          </motion.h1>
          
          <motion.p
            className="text-xl text-amber-800 font-semibold mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Fixing the Pool
          </motion.p>
          
          <motion.div
            className="flex items-center justify-center gap-2 text-amber-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm">We'll be back soon</span>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-pink-100 via-amber-50 to-orange-100 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-md relative z-10 pb-20">
        {/* Header */}
        <motion.div
          className="text-center mb-12 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-block relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-orange-400 blur-2xl opacity-50" />
            <motion.div
              className="text-8xl relative"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🍩
            </motion.div>
          </div>
          <div className="space-y-2">
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h1
                className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-amber-600 to-orange-600 text-3xl font-black"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Donuettes
              </motion.h1>
            </motion.div>
            <p className="text-amber-800">Co-mining Pool</p>
            <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Pool Active
            </div>
          </div>
        </motion.div>

        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ConnectMenu />
        </motion.div>

        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        <main>
          <AnimatePresence mode="wait">
            {activeTab === "donettes-comining" ? (
              <motion.div
                key="comining"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DonettesCoMining />
              </motion.div>
            ) : (
              <motion.div
                key="mining"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DonettesMining />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant="outline"
          onClick={() => disconnect()}
          className="text-xs py-1 px-2 h-auto"
        >
          {address?.slice(0, 4)}...{address?.slice(-4)}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {connectors.map((connector, index) => (
        <motion.div
          key={connector.uid}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            variant="primary"
            onClick={() => connect({ connector })}
            className="text-xs py-1 px-2 h-auto"
          >
            {connector.name === "Injected" ? "Wallet" : connector.name}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default App;

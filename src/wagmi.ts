import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [base],
  connectors: [farcasterMiniApp(), injected()],
  transports: {
    [base.id]: http(import.meta.env.VITE_BASE_RPC_URL),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

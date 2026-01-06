import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { http, createConfig } from "wagmi";
import {
  sepolia,
  // base,
  // mainnet,
} from "wagmi/chains";

export const config = createConfig({
  chains: [
    sepolia,
    // base,
    // mainnet
  ],
  connectors: [miniAppConnector()],
  transports: {
    [sepolia.id]: http(),
    // [base.id]: http(),
    // [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

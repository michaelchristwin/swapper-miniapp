import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, type AppKitNetwork, sepolia } from "@reown/appkit/networks";

export const projectId = import.meta.env.VITE_PROJECT_ID;
if (!projectId) {
  throw new Error("Project ID is not set!");
}
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [sepolia];

export const metadata = {
  name: "Swap Dgen1",
  description: "Swap your dgen1 NFTs.",
  url: "https://swapper-miniapp.vercel.app",
  icons: ["https://swapper-miniapp.vercel.app/swap.png"],
};

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { Toaster } from "react-hot-toast";
import { AppKitProvider, createAppKit } from "@reown/appkit/react";
import App from "./App.tsx";
import {
  config,
  metadata,
  networks,
  projectId,
  wagmiAdapter,
} from "./config/wagmi.ts";
import "./index.css";

const queryClient = new QueryClient();
const generalConfig = {
  projectId,
  networks,
  metadata,
  themeMode: "light" as const,
  themeVariables: {
    "--w3m-accent": "#000000",
  },
};
createAppKit({
  adapters: [wagmiAdapter],
  ...generalConfig,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider projectId={projectId} networks={networks}>
          <Toaster />
          <App />
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);

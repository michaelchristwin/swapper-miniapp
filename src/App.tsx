import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect } from "react";
import { useState } from "react";
import { ArrowDownUp, Wallet, ArrowLeft } from "lucide-react";
import {
  useConnect,
  useConnection,
  useConnectors,
  useSendTransaction,
} from "wagmi";
import { encodeFunctionData, parseUnits } from "viem";
import { swapperContract } from "./config/contracts";
import useSWR from "swr";
import { getUserBucket } from "./util";

type Nft = {
  name: string;
  image: string;
  id: number;
};

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);
  return <NFTSwapDapp />;
}

const NFTSwapDapp = () => {
  const [view, setView] = useState("gallery");
  const [selectedPeerNFT, setSelectedPeerNFT] = useState<Nft | null>(null);
  const [selectedMyNFT, setSelectedMyNFT] = useState<Nft | null>(null);
  const { isConnected, address } = useConnection();
  const connect = useConnect();
  const connectors = useConnectors();
  const { mutate } = useSendTransaction();

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: c1 } = useSWR("/api/dune-proxy", fetcher);
  const { data: c2 } = useSWR("c2", async () => {
    const d = await getUserBucket(address as `0x${string}`);
    return d;
  });

  const handlePeerNFTClick = (nft: Nft) => {
    setSelectedPeerNFT(nft);
    setView("swap");
  };

  const handleSwap = () => {
    mutate({
      to: swapperContract.address,
      data: encodeFunctionData({
        abi: swapperContract.abi,
        functionName: "swap",
        args: [
          parseUnits(selectedPeerNFT?.id.toString() as string, 9),
          parseUnits(selectedMyNFT?.id.toString() as string, 9),
        ],
      }),
    });
  };

  const NFTCard = ({
    nft,
    onClick,
    selected,
  }: {
    nft: Nft;
    onClick: (nft: Nft) => void;
    selected?: boolean;
  }) => (
    <div
      onClick={() => onClick && onClick(nft)}
      className={`bg-linear-to-br from-slate-800 to-slate-900 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 border-2 ${
        selected
          ? "border-cyan-400 shadow-lg shadow-cyan-500/50"
          : "border-slate-700"
      }`}
    >
      <div className="aspect-square bg-linear-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center text-6xl mb-3">
        {nft.image}
      </div>
      <h3 className="text-white font-semibold text-sm mb-1">{nft.name}</h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
              <ArrowDownUp className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">NFT Swap</h1>
              <p className="text-gray-400 text-sm">
                Trade NFTs with your peers
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-linear-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-3 rounded-full font-semibold transition-all">
            <Wallet size={20} />
            0x7a4f...b23c
          </button>
        </div>

        {/* Gallery View */}
        {view === "gallery" && (
          <div className="animate-fadeIn">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">
                Peer's Collection
              </h2>
              {c1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...c1].map((nft, index) => (
                    <NFTCard
                      key={index}
                      nft={{ name: "shitcoin1", image: "🔥", id: nft.token_id }}
                      onClick={handlePeerNFTClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Swap View */}
        {view === "swap" && (
          <div className="animate-fadeIn">
            <button
              onClick={() => {
                setView("gallery");
                setSelectedMyNFT(null);
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Gallery
            </button>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              {/* Selected Peer NFT */}
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">
                  You receive
                </label>
                <div className="bg-slate-900 rounded-xl p-6 border-2 border-cyan-400">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-linear-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center text-4xl">
                      {selectedPeerNFT?.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">
                        {selectedPeerNFT?.name}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Swap Icon */}
              <div className="flex justify-center my-6">
                <div className="w-12 h-12 bg-linear-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                  <ArrowDownUp className="text-white" size={24} />
                </div>
              </div>

              {/* Select Your NFT */}
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">
                  You send
                </label>
                {selectedMyNFT ? (
                  <div className="bg-slate-900 rounded-xl p-6 border-2 border-purple-400 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-linear-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center text-4xl">
                        {selectedMyNFT.image}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">
                          {selectedMyNFT.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedMyNFT(null)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-xl p-6 border-2 border-dashed border-slate-700 mb-4">
                    <p className="text-gray-400 text-center">
                      Select an NFT from your collection
                    </p>
                  </div>
                )}

                {!selectedMyNFT && c2 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {c2.map((nft, index) => (
                      <NFTCard
                        key={index}
                        nft={{
                          name: "shitcoin1",
                          image: "🔥",
                          id: nft.token_id,
                        }}
                        onClick={setSelectedMyNFT}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              {isConnected && selectedPeerNFT && selectedMyNFT && (
                <button
                  onClick={handleSwap}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-linear-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/50"
                >
                  Swap NFTs
                </button>
              )}
              {!isConnected && (
                <button
                  type="button"
                  onClick={() => connect.mutate({ connector: connectors[0] })}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-linear-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/50"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;

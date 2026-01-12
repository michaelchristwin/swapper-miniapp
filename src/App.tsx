import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect } from "react";
import { useState } from "react";
import { ArrowDownUp, ArrowLeft } from "lucide-react";
import {
  useConnection,
  useSendTransaction,
  useReadContracts,
  useReadContract,
} from "wagmi";
import { encodeFunctionData } from "viem";
import { contractA, contractB, swapperContract } from "./config/contracts";
import useSWR from "swr";
import toast from "react-hot-toast";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "./config/wagmi";
import { useAppKit } from "@reown/appkit/react";

type MetaData = {
  description: string;
  name: string;
  image: string;
};

type Nft = {
  id: bigint;
};

function App() {
  useEffect(() => {
    (async () => {
      const isMini = await sdk.isInMiniApp();
      if (isMini) {
        sdk.actions.ready();
      }
    })();
  }, []);
  return <NFTSwapDapp />;
}

const NFTSwapDapp = () => {
  const [view, setView] = useState("gallery");
  const [selectedPeerNFT, setSelectedPeerNFT] = useState<Nft | null>(null);
  const [selectedMyNFT, setSelectedMyNFT] = useState<Nft | null>(null);
  const { isConnected, address } = useConnection();
  const { open } = useAppKit();

  const { data: balanceData } = useReadContract({
    ...contractB,
    functionName: "balanceOf",
    args: [address!],
    query: {
      enabled: isConnected && !!address,
    },
  });

  console.log("BalanceData: ", balanceData);
  const balance = balanceData ? Number(balanceData) : 0;
  console.log("Balance: ", balance);
  const { data: tokenIdsData, isLoading: _idsLoading } = useReadContracts({
    allowFailure: true, // set true if you want partial results on failure
    //@ts-ignore
    contracts:
      address && balance > 0
        ? Array.from({ length: balance }, (_, i) => ({
            ...contractB,
            functionName: "tokenOfOwnerByIndex" as const,
            args: [address, BigInt(i)],
          }))
        : [],
    query: {
      enabled: !!address && balance > 0,
    },
  });
  const tokenIds = tokenIdsData
    //@ts-ignore
    ?.map((res) => (res.status === "success" ? res.result : null))
    .filter(Boolean);

  const { data: c1, refetch } = useReadContract({
    ...swapperContract,
    functionName: "getAvailableTokens",
  });

  const handlePeerNFTClick = (nft: Nft) => {
    setSelectedPeerNFT(nft);
    setView("swap");
  };

  const { mutateAsync: sendTx } = useSendTransaction();

  const [isApproving, setIsApproving] = useState(false);
  const [isApproveConfirmed, setIsApproveConfirmed] = useState(false);

  const [isSwapping, setIsSwapping] = useState(false);
  const [isSwapConfirmed, setIsSwapConfirmed] = useState(false);

  const handleSwap = async () => {
    try {
      // APPROVE
      setIsApproving(true);
      setIsApproveConfirmed(false);

      const approveHash = await sendTx({
        to: contractB.address,
        data: encodeFunctionData({
          abi: contractB.abi,
          functionName: "approve",
          args: [swapperContract.address, selectedMyNFT!.id],
        }),
      });

      await waitForTransactionReceipt(config, { hash: approveHash });

      setIsApproving(false);
      setIsApproveConfirmed(true);

      // SWAP
      setIsSwapping(true);
      setIsSwapConfirmed(false);

      const swapHash = await sendTx({
        to: swapperContract.address,
        data: encodeFunctionData({
          abi: swapperContract.abi,
          functionName: "swap",
          args: [selectedPeerNFT!.id, selectedMyNFT!.id],
        }),
      });

      await waitForTransactionReceipt(config, { hash: swapHash });

      setIsSwapping(false);
      setIsSwapConfirmed(true);
    } catch (err) {
      setIsApproving(false);
      setIsSwapping(false);
      throw err;
    }
  };

  useEffect(() => {
    if (isApproveConfirmed) {
      toast.success("Approval Sucessful");
    }
  }, [isApproveConfirmed]);

  useEffect(() => {
    if (isSwapConfirmed) {
      toast.success("Swap Successful");
      setSelectedMyNFT(null);
      setSelectedPeerNFT(null);
      setView("gallery");
      refetch();
    }
  }, [isSwapConfirmed]);

  const NFTCard = ({
    nft,
    onClick,
    selected,
    og,
  }: {
    nft: Nft;
    onClick: (nft: Nft) => void;
    selected?: boolean;
    og: boolean;
  }) => (
    <div
      onClick={() => onClick && onClick(nft)}
      className={`bg-linear-to-br min-w-20 min-h-30 from-slate-800 to-slate-900 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 border-2 ${
        selected
          ? "border-cyan-400 shadow-lg shadow-cyan-500/50"
          : "border-slate-700"
      }`}
    >
      <div className="aspect-square bg-linear-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center text-6xl mb-3">
        <TokenUriImage id={nft.id} og={og} />
      </div>
      <TokenUriName id={nft.id} og={og} />
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
              <p className="text-gray-400 text-sm">I'll trade ya</p>
            </div>
          </div>
        </div>

        {/* Gallery View */}
        {view === "gallery" && (
          <div className="animate-fadeIn">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">
                Select desired NFT
              </h2>
              {c1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...(c1 as bigint[])].map((nft, index) => (
                    <NFTCard
                      key={index}
                      nft={{
                        id: nft,
                      }}
                      onClick={handlePeerNFTClick}
                      og={true}
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

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl md:p-8 p-3 border border-slate-700">
              {/* Selected Peer NFT */}
              <div className="flex justify-between w-full items-center">
                <div className="mb-6">
                  <label className="text-gray-400 text-sm mb-2 block">
                    You receive
                  </label>
                  {selectedPeerNFT && (
                    <div className="bg-slate-900 rounded-xl p-6 border-2 border-cyan-400 md:w-60 md:h-70 w-30 h-40">
                      <div className="flex flex-col items-center">
                        <div className="h-full w-full bg-linear-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center text-4xl">
                          <TokenUriImage id={selectedPeerNFT.id} og />
                        </div>
                        <div className="flex-1">
                          <TokenUriName id={selectedPeerNFT.id} og />
                        </div>
                      </div>
                    </div>
                  )}
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
                    <div className="bg-slate-900 rounded-xl p-6 border-2 border-purple-400 mb-4 md:w-60 md:h-70 w-30 h-40">
                      <div className="block gap-4">
                        <div className="h-full w-full bg-linear-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center text-4xl">
                          <TokenUriImage id={selectedMyNFT.id} og={false} />
                        </div>
                        <div className="flex-1">
                          <TokenUriName id={selectedMyNFT.id} og={false} />
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

                  {!selectedMyNFT && tokenIds && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {tokenIds.map((nft, index) => (
                        <NFTCard
                          key={index}
                          nft={{
                            id: nft as bigint,
                          }}
                          onClick={setSelectedMyNFT}
                          og={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Swap Button */}

              {isConnected && selectedPeerNFT && selectedMyNFT && (
                <button
                  onClick={handleSwap}
                  disabled={isSwapping || isApproving}
                  className="w-full flex disabled:opacity-60 items-center justify-center space-x-1.5 py-4 rounded-xl font-bold text-lg transition-all bg-linear-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/50"
                >
                  <span>Swap NFTs</span>
                  {isSwapping ||
                    (isApproving && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-loader-circle-icon lucide-loader-circle animate-spin"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    ))}
                </button>
              )}
              {!isConnected && (
                <button
                  type="button"
                  onClick={() => open()}
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

const TokenUriImage = ({ id, og }: { id: bigint; og: boolean }) => {
  const {
    data: uri,
    error: e1,
    isLoading: isLoading1,
  } = useReadContract({
    address: og ? contractA.address : contractB.address,
    abi: og ? contractA.abi : contractB.abi,
    functionName: "tokenURI" as const,
    args: [id],
  });

  const {
    data: metadata,
    error: e2,
    isLoading: isLoading2,
  } = useSWR(uri ? ["tokenUri", uri] : null, async () => {
    const response = await fetch(uri as string);
    const data: MetaData = await response.json();
    return data;
  });
  if (isLoading1) {
    return (
      <div className="flex justify-center items-center w-fit h-full">
        <p className="text-sm text-center">Loading...</p>
      </div>
    );
  }
  if (isLoading2) {
    return (
      <div className="flex justify-center items-center w-fit h-full">
        <p className="text-sm text-center">Loading...</p>
      </div>
    );
  }

  if (e1) {
    return (
      <div className="flex justify-center items-center w-fit h-full">
        <p className="text-sm text-center">Failed to get metadata.</p>
      </div>
    );
  }
  if (e2) {
    return (
      <div className="flex justify-center items-center w-fit h-full">
        <p className="text-sm text-center">Failed to get metadata.</p>
      </div>
    );
  }

  if (metadata) {
    const src = metadata.image;

    const isVideo = /\.(mp4|webm|ogg)$/i.test(src);

    return isVideo ? (
      <video src={src} autoPlay loop muted />
    ) : (
      <img src={src} alt="NFT" />
    );
  }
};

const TokenUriName = ({ id, og }: { id: bigint; og: boolean }) => {
  const {
    data: uri,
    error: e1,
    isLoading: isLoading1,
  } = useReadContract({
    address: og ? contractA.address : contractB.address,
    abi: og ? contractA.abi : contractB.abi,
    functionName: "tokenURI",
    args: [id],
  });
  const {
    data: metadata,
    error: e2,
    isLoading: isLoading2,
  } = useSWR(uri ? ["tokenUri", uri] : null, async () => {
    const response = await fetch(uri as string);
    const data: MetaData = await response.json();
    return data;
  });
  if (isLoading1) {
    return <p className="text-sm text-center">Loading...</p>;
  }
  if (isLoading2) {
    return <p className="text-sm text-center">Loading...</p>;
  }

  if (e1) {
    return (
      <div className="flex justify-center items-center w-fit h-full">
        <p className="text-sm text-center">Failed to get metadata.</p>
      </div>
    );
  }
  if (e2) {
    return (
      <div className="flex justify-center items-center w-fit h-full">
        <p className="text-sm text-center">Failed to get metadata.</p>
      </div>
    );
  }
  if (metadata) {
    return (
      <h3 className="text-white font-semibold text-sm mb-1">
        {metadata.name} #{Number(id)}
      </h3>
    );
  }
};

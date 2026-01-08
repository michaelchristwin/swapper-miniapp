import { swapperABI, nftABI } from "./ABIs";

export const swapperContract = {
  address: "0xbB71e921EA9Bd33EB03a11B3Bc3Cef2E6cA24006",
  abi: swapperABI,
} as const;

export const contractA = {
  address: "0xA39626695A3bE5F151D52eE65201F485411E481F",
  abi: nftABI,
} as const;

export const contractB = {
  address: "0x4E6A5E219092C39102B1Ccf1BAF330f498e4B7a0",
  abi: nftABI,
} as const;

import {
  swapperABI,
  Dgen1OGABI,
  Dgen1ALTABI,
  swapperTestnetABI,
  contractATestnetABI,
  contractBTestnetABI,
} from "./ABIs";

export const swapperContract = {
  address: "0x3a38e68608AD7919A8A5C23A9c5eE1bf5a9E2BC0",
  abi: swapperABI,
} as const;

export const contractA = {
  address: "0x7533E410Ed2780807488B0068399788b2932B4e1",
  abi: Dgen1OGABI,
} as const;

export const contractB = {
  address: "0xF93A86D2678E925B97F19A3c848681DfF4Fa5403",
  abi: Dgen1ALTABI,
} as const;

export const swapperTestnet = {
  address: "0x4Ec78a82cf1e3cCd91363BC4f4e0A01ba8cfaAEa",
  abi: swapperTestnetABI,
} as const;

export const contractATestnet = {
  address: "0xc94F5aD921b793FAd5Bdff3e804CDE02b824Dd09",
  abi: contractATestnetABI,
} as const;

export const contractBTestnet = {
  address: "0x3F7521E8eD780627eD3DEa5E7e70492161F3B741",
  abi: contractBTestnetABI,
} as const;

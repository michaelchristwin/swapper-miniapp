import { swapperABI, Dgen1OGABI, Dgen1ALTABI } from "./ABIs";

export const swapperContract = {
  address: "0x3a38e68608AD7919A8A5C23A9c5eE1bf5a9E2BC0",
  abi: swapperABI,
} as const;

export const contractA = {
  address: "0x7533E410Ed2780807488B0068399788b2932B4e1 ",
  abi: Dgen1OGABI,
} as const;

export const contractB = {
  address: "0xF93A86D2678E925B97F19A3c848681DfF4Fa5403",
  abi: Dgen1ALTABI,
} as const;

import { readContract } from "@wagmi/core";
import { config } from "./config/wagmi";
import { contractB } from "./config/contracts";

export async function getUserBucket(owner: `0x${string}`) {
  type btype = {
    token_id: number;
  };
  let bucket: btype[] = [];
  for (let index = 0; index < 9; index++) {
    const r = await readContract(config, {
      ...contractB,
      functionName: "ownerOf",
    });
    if (r === owner) bucket.push({ token_id: index });
  }
  return bucket;
}

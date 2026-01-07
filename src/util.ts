import { readContract } from "@wagmi/core";
import { config } from "./config/wagmi";
import { contractB } from "./config/contracts";

export async function getUserBucket(owner: `0x${string}`) {
  console.log("before readContract");
  let bucket: { token_id: number }[] = [];
  for (let index = 0; index < 9; index++) {
    const r = await readContract(config, {
      ...contractB,
      functionName: "ownerOf",
      args: [BigInt(index)],
    });

    if ((r as string).toLowerCase() === owner.toLowerCase()) {
      bucket.push({ token_id: index });
    }
  }
  console.log("Bucket: ", bucket);
  return bucket;
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DuneClient } from "@duneanalytics/client-sdk";

const dune = new DuneClient(process.env.DUNE_API_KEY!);

export default async function handler(
  _request: VercelRequest,
  response: VercelResponse
) {
  try {
    const duneResponse = await dune.getLatestResult({ queryId: 6474621 });

    return response.status(200).json(duneResponse.result?.rows || []);
  } catch (error) {
    console.error("inner:", error);
    return response.status(500).json({ error: "Failed to fetch from Dune" });
  }
}

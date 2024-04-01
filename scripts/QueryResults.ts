import { sepolia } from "viem/chains";
import { createPublicClient, http, hexToString } from "viem";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 1)
    throw new Error("Parameters not provided.");
  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  const winnerNameHash = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "winnerName",
  });
  const stringValue: `0x${string}` = winnerNameHash as `0x${string}`;
  const winnerName = hexToString(stringValue);
  console.log("Winner name:", winnerName);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

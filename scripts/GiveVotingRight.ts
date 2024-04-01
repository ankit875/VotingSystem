import { sepolia } from "viem/chains";
import {
  createPublicClient,
  http,
  createWalletClient,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const blockNumber = await publicClient.getBlockNumber();
  console.log("Last block number:", blockNumber);
  const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
  const voter = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  console.log("Deployer address:", voter.account.address);

  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 2)
    throw new Error(
      "Parameters not provided. Usage: <contract address> <voter address>"
    );
  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  const voterAddresses = parameters.slice(1);
  console.log("voterAddresses", parameters, voterAddresses);
  if (!voterAddresses || voterAddresses.length < 1)
    throw new Error("Voter addresses not provided");
  for (const voterAddress of voterAddresses) {
    console.log("voterAddresses", voterAddress);
    const hash = await voter.writeContract({
      address: contractAddress,
      abi,
      functionName: "giveRightToVote",
      args: [voterAddress],
    });
    console.log(
      `Give voting right to ${voterAddress} transaction hash: ${hash}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

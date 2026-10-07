import "dotenv/config";
import { network } from "hardhat";
import fs from "node:fs";

async function main() {
  const connection = await network.connect();
  const ethers = (connection as any).ethers;

  let contractAddress =
    process.env.PROOFFUND_CONTRACT_ADDRESS ||
    process.env.VITE_PROOFFUND_CONTRACT_ADDRESS;

  if (!contractAddress && fs.existsSync(".env.local")) {
    const envLocal = fs.readFileSync(".env.local", "utf8");

    const match = envLocal.match(
      /VITE_PROOFFUND_CONTRACT_ADDRESS\s*=\s*(0x[a-fA-F0-9]{40})/
    );

    if (match) {
      contractAddress = match[1];
    }
  }

  if (!contractAddress) {
    throw new Error(
      "Could not find VITE_PROOFFUND_CONTRACT_ADDRESS in .env.local"
    );
  }

  console.log("\n=== ProofFund Sepolia Status ===");
  console.log("Contract:", contractAddress);

  const contract = await ethers.getContractAt(
    "ProofFundCampaign",
    contractAddress
  );

  console.log(
    "Goal:",
    ethers.formatEther(await contract.goal()),
    "ETH"
  );

  console.log(
    "Raised:",
    ethers.formatEther(await contract.totalRaised()),
    "ETH"
  );

  console.log(
    "Campaign state:",
    (await contract.campaignState()).toString()
  );

  console.log(
    "Creator:",
    await contract.creator()
  );

  console.log(
    "Security stake:",
    ethers.formatEther(
      await contract.securityStake()
    ),
    "ETH"
  );

  console.log("===============================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { network } from "hardhat";

async function main() {
  const connection = await network.connect();
  const ethers = (connection as any).ethers;

  const [deployer] = await ethers.getSigners();

  console.log("Deploying ProofFundCampaign...");
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(
    deployer.address
  );

  console.log(
    "Deployer balance:",
    ethers.formatEther(balance),
    "ETH"
  );

  const ProofFundCampaign =
    await ethers.getContractFactory(
      "ProofFundCampaign"
    );

  // Demo deployment values
  const goal = ethers.parseEther("0.01");

  // ProofFund requires exactly 10% of the goal
  const securityStake = ethers.parseEther("0.001");

  const latestBlock =
    await ethers.provider.getBlock("latest");

  if (!latestBlock) {
    throw new Error("Could not fetch latest block");
  }

  const deadline =
    BigInt(latestBlock.timestamp) +
    7n * 24n * 60n * 60n;

  const milestoneDescriptions = [
    "Research and planning",
    "Prototype development",
    "Final deployment",
  ];

  const milestoneAmounts = [
    ethers.parseEther("0.004"),
    ethers.parseEther("0.003"),
    ethers.parseEther("0.003"),
  ];

  const milestoneDeadlines = [
    deadline - 5n * 24n * 60n * 60n,
    deadline - 2n * 24n * 60n * 60n,
    deadline,
  ];

  console.log("Deploying contract...");

  const campaign =
    await ProofFundCampaign.deploy(
      deployer.address,
      goal,
      deadline,
      securityStake,
      milestoneDescriptions,
      milestoneAmounts,
      milestoneDeadlines,
      {
        value: securityStake,
      }
    );

  await campaign.waitForDeployment();

  const address =
    await campaign.getAddress();

  console.log("");
  console.log("=================================");
  console.log("ProofFund deployed successfully!");
  console.log("=================================");
  console.log("Contract:", address);
  console.log("Network: Sepolia");
  console.log(
    "Goal:",
    ethers.formatEther(goal),
    "ETH"
  );
  console.log(
    "Security stake:",
    ethers.formatEther(securityStake),
    "ETH"
  );
  console.log(
    "Deadline:",
    deadline.toString()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
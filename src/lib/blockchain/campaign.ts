import {
  formatEther,
  parseEther,
} from "ethers";

import {
  getReadContract,
  getWriteContract,
} from "./contract";

const MILESTONE_STATES = [
  "Pending",
  "Voting",
  "ApprovedPendingDispute",
  "Disputed",
  "Released",
  "Rejected",
  "Failed",
] as const;

export async function getCampaignDetails() {
  const contract = getReadContract() as any;

  const [
    goal,
    totalRaised,
    deadline,
    totalReleased,
    campaignState,
    creator,
    securityStake,
  ] = await Promise.all([
    contract.goal(),
    contract.totalRaised(),
    contract.deadline(),
    contract.totalReleased(),
    contract.campaignState(),
    contract.creator(),
    contract.securityStake(),
  ]);

  return {
    goal: formatEther(goal),
    totalRaised: formatEther(totalRaised),
    deadline: Number(deadline),
    totalReleased: formatEther(totalReleased),
    campaignState: Number(campaignState),
    creator,
    securityStake: formatEther(securityStake),
  };
}

export async function getMilestone(
  milestoneId: number
) {
  const contract = getReadContract() as any;

  const milestone =
    await contract.milestones(milestoneId);

  return {
    amount: formatEther(milestone.amount),
    deadline: Number(milestone.deadline),
    description: milestone.description,
    proofCID: milestone.proofCID,
    proofHash: milestone.proofHash,
    voteStart: Number(milestone.voteStart),
    disputeDeadline: Number(
      milestone.disputeDeadline
    ),
    snapshotTotalWeight: formatEther(
      milestone.snapshotTotalWeight
    ),
    yesWeight: formatEther(
      milestone.yesWeight
    ),
    noWeight: formatEther(
      milestone.noWeight
    ),
    resubmissionCount: Number(
      milestone.resubmissionCount
    ),
    state: Number(milestone.state),
    stateLabel:
      MILESTONE_STATES[
        Number(milestone.state)
      ] ?? "Unknown",
  };
}

export async function getMilestones(
  count: number
) {
  return Promise.all(
    Array.from(
      { length: count },
      (_, index) => getMilestone(index)
    )
  );
}
export async function donateToCampaign(
  amountEth: string
) {
  const contract = await getWriteContract();

  const donate =
    contract.getFunction("donate");

  const tx = await donate({
    value: parseEther(amountEth),
  });

  console.log(
    "Donation transaction:",
    tx.hash
  );

  const receipt = await tx.wait();

  console.log(
    "Donation confirmed:",
    receipt?.hash
  );

  return {
    hash: tx.hash,
  };
}
export async function submitProofToCampaign(
  milestoneId: number,
  proofCID: string,
  proofHash: string
) {
  const contract = await getWriteContract();

  const submitProof =
    contract.getFunction("submitProof");

  const tx = await submitProof(
    milestoneId,
    proofCID,
    proofHash
  );

  console.log(
    "Proof submission transaction:",
    tx.hash
  );

  const receipt = await tx.wait();

  console.log(
    "Proof submission confirmed:",
    receipt?.hash
  );

  return {
    hash: tx.hash,
  };
}
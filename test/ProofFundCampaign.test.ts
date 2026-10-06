import { expect } from "chai";
import { network } from "hardhat";

describe("ProofFundCampaign", function () {
  let ethers: any;

  before(async function () {
    const connection = await network.connect();
    ethers = connection.ethers;
  });

  // ------------------------------------------------------------
  // Helper: expect a transaction to revert
  // ------------------------------------------------------------

  async function expectRevert(
    action: () => Promise<any>
  ) {
    let reverted = false;

    try {
      await action();
    } catch {
      reverted = true;
    }

    expect(reverted).to.equal(true);
  }

  // ------------------------------------------------------------
  // Helper: deploy a fresh campaign
  // ------------------------------------------------------------

  async function deployCampaign() {
    const [
      creator,
      donor1,
      donor2,
      donor3,
      stranger,
    ] = await ethers.getSigners();

    const goal = ethers.parseEther("10");
    const stake = ethers.parseEther("1");

    const latestBlock =
      await ethers.provider.getBlock("latest");

    const deadline =
      BigInt(latestBlock!.timestamp) +
      30n * 24n * 60n * 60n;

    const milestoneAmounts = [
      ethers.parseEther("4"),
      ethers.parseEther("3"),
      ethers.parseEther("3"),
    ];

    const milestoneDescriptions = [
      "Research and planning",
      "Prototype development",
      "Final deployment",
    ];

    const milestoneDeadlines = [
      deadline - 15n * 24n * 60n * 60n,
      deadline - 7n * 24n * 60n * 60n,
      deadline,
    ];

    const Factory =
      await ethers.getContractFactory(
        "ProofFundCampaign"
      );

    const campaign = await Factory.deploy(
      creator.address,
      goal,
      deadline,
      stake,
      milestoneDescriptions,
      milestoneAmounts,
      milestoneDeadlines,
      {
        value: stake,
      }
    );

    await campaign.waitForDeployment();

    return {
      campaign,
      creator,
      donor1,
      donor2,
      donor3,
      stranger,
      goal,
      stake,
      deadline,
    };
  }

  // ============================================================
  // DEPLOYMENT
  // ============================================================

  describe("Deployment", function () {
    it("sets the campaign creator", async function () {
      const {
        campaign,
        creator,
      } = await deployCampaign();

      expect(
        await campaign.creator()
      ).to.equal(creator.address);
    });

    it("sets the campaign goal", async function () {
      const {
        campaign,
        goal,
      } = await deployCampaign();

      expect(
        await campaign.goal()
      ).to.equal(goal);
    });

    it("sets the security stake", async function () {
      const {
        campaign,
        stake,
      } = await deployCampaign();

      expect(
        await campaign.securityStake()
      ).to.equal(stake);
    });

    it("starts in Funding state", async function () {
      const { campaign } =
        await deployCampaign();

      // CampaignState.Funding = 0
      expect(
        await campaign.campaignState()
      ).to.equal(0n);
    });

    it("requires the correct 10% security stake", async function () {
      const [creator] =
        await ethers.getSigners();

      const goal =
        ethers.parseEther("10");

      const wrongStake =
        ethers.parseEther("0.5");

      const latestBlock =
        await ethers.provider.getBlock(
          "latest"
        );

      const deadline =
        BigInt(latestBlock!.timestamp) +
        7n * 24n * 60n * 60n;

      const Factory =
        await ethers.getContractFactory(
          "ProofFundCampaign"
        );

      await expectRevert(() =>
        Factory.deploy(
          creator.address,
          goal,
          deadline,
          wrongStake,
          ["Milestone"],
          [goal],
          [deadline],
          {
            value: wrongStake,
          }
        )
      );
    });

    it("requires milestone amounts to equal the goal", async function () {
      const [creator] =
        await ethers.getSigners();

      const goal =
        ethers.parseEther("10");

      const stake =
        ethers.parseEther("1");

      const latestBlock =
        await ethers.provider.getBlock(
          "latest"
        );

      const deadline =
        BigInt(latestBlock!.timestamp) +
        7n * 24n * 60n * 60n;

      const Factory =
        await ethers.getContractFactory(
          "ProofFundCampaign"
        );

      await expectRevert(() =>
        Factory.deploy(
          creator.address,
          goal,
          deadline,
          stake,
          [
            "Milestone 1",
            "Milestone 2",
          ],
          [
            ethers.parseEther("4"),
            ethers.parseEther("5"),
          ],
          [
            deadline,
            deadline,
          ],
          {
            value: stake,
          }
        )
      );
    });
  });

  // ============================================================
  // DONATIONS
  // ============================================================

  describe("Donations", function () {
    it("accepts donations", async function () {
      const {
        campaign,
        donor1,
      } = await deployCampaign();

      await campaign
        .connect(donor1)
        .donate({
          value: ethers.parseEther("3"),
        });

      expect(
        await campaign.contributions(
          donor1.address
        )
      ).to.equal(
        ethers.parseEther("3")
      );

      expect(
        await campaign.totalRaised()
      ).to.equal(
        ethers.parseEther("3")
      );
    });

    it("tracks multiple donors", async function () {
      const {
        campaign,
        donor1,
        donor2,
      } = await deployCampaign();

      await campaign
        .connect(donor1)
        .donate({
          value: ethers.parseEther("3"),
        });

      await campaign
        .connect(donor2)
        .donate({
          value: ethers.parseEther("2"),
        });

      expect(
        await campaign.totalRaised()
      ).to.equal(
        ethers.parseEther("5")
      );

      expect(
        await campaign.getDonorCount()
      ).to.equal(2n);
    });

    it("moves to Active when goal is reached", async function () {
      const {
        campaign,
        donor1,
        donor2,
        goal,
      } = await deployCampaign();

      await campaign
        .connect(donor1)
        .donate({
          value: ethers.parseEther("6"),
        });

      await campaign
        .connect(donor2)
        .donate({
          value: ethers.parseEther("4"),
        });

      expect(
        await campaign.totalRaised()
      ).to.equal(goal);

      // CampaignState.Active = 1
      expect(
        await campaign.campaignState()
      ).to.equal(1n);
    });
  });

  // ============================================================
  // PROOF SUBMISSION
  // ============================================================

  describe("Proof submission", function () {
    it("allows the creator to submit proof after the goal is reached", async function () {
  const {
    campaign,
    creator,
    donor1,
    donor2,
  } = await deployCampaign();

  // Reach the campaign goal.
  await campaign
    .connect(donor1)
    .donate({
      value: ethers.parseEther("6"),
    });

  await campaign
    .connect(donor2)
    .donate({
      value: ethers.parseEther("4"),
    });

  const proofHash =
    ethers.keccak256(
      ethers.toUtf8Bytes(
        "test-proof"
      )
    );

  await campaign
    .connect(creator)
    .submitProof(
      0,
      "ipfs://test-cid",
      proofHash
    );

  const milestone =
    await campaign.getMilestone(0);

  expect(
    milestone.proofCID
  ).to.equal(
    "ipfs://test-cid"
  );

  expect(
    milestone.proofHash
  ).to.equal(proofHash);
});

    it("rejects proof submission from a non-creator", async function () {
      const {
        campaign,
        donor1,
      } = await deployCampaign();

      const proofHash =
        ethers.keccak256(
          ethers.toUtf8Bytes(
            "test-proof"
          )
        );

      await expectRevert(() =>
        campaign
          .connect(donor1)
          .submitProof(
            0,
            "ipfs://test-cid",
            proofHash
          )
      );
     
    });
  });

   // ============================================================
  // VOTING
  // ============================================================

  describe("Voting", function () {

    async function setupVoting() {
      const result = await deployCampaign();

      const {
        campaign,
        creator,
        donor1,
        donor2,
        donor3,
      } = result;

      // Reach the 10 ETH campaign goal.
      await campaign
        .connect(donor1)
        .donate({
          value: ethers.parseEther("4"),
        });

      await campaign
        .connect(donor2)
        .donate({
          value: ethers.parseEther("3"),
        });

      await campaign
        .connect(donor3)
        .donate({
          value: ethers.parseEther("3"),
        });

      // Submit milestone proof.
      const proofHash = ethers.keccak256(
        ethers.toUtf8Bytes("milestone-proof")
      );

      await campaign
        .connect(creator)
        .submitProof(
          0,
          "ipfs://proof",
          proofHash
        );

      // Open voting.
      await campaign
        .connect(creator)
        .openVoting(0);

      return result;
    }

    it("opens voting after proof submission", async function () {
      const { campaign } = await setupVoting();

      const milestone =
        await campaign.getMilestone(0);

      // MilestoneState.Voting = 1
      expect(milestone.state).to.equal(1n);
    });

    it("applies the 25% voting weight cap", async function () {
      const {
        campaign,
        donor1,
      } = await setupVoting();

      /*
       * Total raised = 10 ETH
       *
       * Maximum voting weight =
       * 25% of 10 ETH = 2.5 ETH
       *
       * donor1 contributed 4 ETH,
       * so their voting weight is capped
       * at 2.5 ETH.
       */

      expect(
        await campaign.snapshotWeight(
          0,
          donor1.address
        )
      ).to.equal(
        ethers.parseEther("2.5")
      );
    });

    it("prevents double voting", async function () {
      const {
        campaign,
        donor1,
      } = await setupVoting();

      await campaign
        .connect(donor1)
        .vote(0, true);

      await expectRevert(() =>
        campaign
          .connect(donor1)
          .vote(0, true)
      );
    });

    it("prevents non-donors from voting", async function () {
      const {
        campaign,
        stranger,
      } = await setupVoting();

      await expectRevert(() =>
        campaign
          .connect(stranger)
          .vote(0, true)
      );
    });

    it("records YES votes", async function () {
      const {
        campaign,
        donor1,
      } = await setupVoting();

      await campaign
        .connect(donor1)
        .vote(0, true);

      const milestone =
        await campaign.getMilestone(0);

      expect(
        milestone.yesWeight
      ).to.equal(
        ethers.parseEther("2.5")
      );
    });

    it("records NO votes", async function () {
      const {
        campaign,
        donor1,
      } = await setupVoting();

      await campaign
        .connect(donor1)
        .vote(0, false);

      const milestone =
        await campaign.getMilestone(0);

      expect(
        milestone.noWeight
      ).to.equal(
        ethers.parseEther("2.5")
      );
    });

    it("does not allow voting to be finalized before the voting window ends", async function () {
      const {
        campaign,
        donor1,
        donor2,
      } = await setupVoting();

      await campaign
        .connect(donor1)
        .vote(0, true);

      await campaign
        .connect(donor2)
        .vote(0, true);

      // Voting window is still active.
      await expectRevert(
        () => campaign.finalizeVote(0)
      );
    });

        it("approves a milestone when quorum and approval threshold are satisfied", async function () {
      const {
        campaign,
        donor1,
        donor2,
      } = await setupVoting();

      // Both donors vote YES.
      await campaign
        .connect(donor1)
        .vote(0, true);

      await campaign
        .connect(donor2)
        .vote(0, true);

      // Advance past the 48-hour voting window.
      await ethers.provider.send(
        "evm_increaseTime",
        [48 * 60 * 60]
      );

      await ethers.provider.send(
        "evm_mine",
        []
      );

  
const before =
  await campaign.getMilestone(0);

//console.log(
  //"REJECTION TEST resubmissions:",
  //before.resubmissionCount
//);

      await campaign.finalizeVote(0);

      const milestone =
        await campaign.getMilestone(0);

      // MilestoneState.ApprovedPendingDispute = 2
      expect(
        milestone.state
      ).to.equal(2n);
    });


    // 👇 PASTE THE NEW TEST HERE 👇

    it("rejects a milestone when approval is below 60%", async function () {
      const {
        campaign,
        donor1,
        donor2,
        donor3,
      } = await setupVoting();

      // All donors vote NO.
      await campaign
        .connect(donor1)
        .vote(0, false);

      await campaign
        .connect(donor2)
        .vote(0, false);

      await campaign
        .connect(donor3)
        .vote(0, false);

      // Wait for the 48-hour voting window.
      await ethers.provider.send(
        "evm_increaseTime",
        [48 * 60 * 60]
      );

      await ethers.provider.send(
        "evm_mine",
        []
      );

      await campaign.finalizeVote(0);

      const milestone =
        await campaign.getMilestone(0);

      // MilestoneState.Rejected = 5
expect(
  milestone.state
).to.equal(5n);
    });
it("fails the campaign after a milestone is rejected twice", async function () {
  const {
    campaign,
    creator,
    donor1,
    donor2,
    donor3,
  } = await setupVoting();

  // ============================================================
  // FIRST VOTE: REJECT
  // ============================================================

  await campaign
    .connect(donor1)
    .vote(0, false);

  await campaign
    .connect(donor2)
    .vote(0, false);

  await campaign
    .connect(donor3)
    .vote(0, false);

  // Wait for voting window.
  await ethers.provider.send(
    "evm_increaseTime",
    [48 * 60 * 60]
  );

  await ethers.provider.send(
    "evm_mine",
    []
  );

  await campaign.finalizeVote(0);

  let milestone =
    await campaign.getMilestone(0);

  // First rejection.
  expect(
    milestone.state
  ).to.equal(5n);

  // ============================================================
  // SECOND SUBMISSION
  // ============================================================

  const secondProofHash =
    ethers.keccak256(
      ethers.toUtf8Bytes(
        "second-proof"
      )
    );

  await campaign
    .connect(creator)
    .submitProof(
      0,
      "ipfs://second-proof",
      secondProofHash
    );

  milestone =
    await campaign.getMilestone(0);

  // Proof should have been replaced.
  expect(
    milestone.proofCID
  ).to.equal(
    "ipfs://second-proof"
  );

  // ============================================================
  // SECOND VOTE
  // ============================================================

  await campaign
    .connect(creator)
    .openVoting(0);

  await campaign
    .connect(donor1)
    .vote(0, false);

  await campaign
    .connect(donor2)
    .vote(0, false);

  await campaign
    .connect(donor3)
    .vote(0, false);

  // Wait for second voting window.
  await ethers.provider.send(
    "evm_increaseTime",
    [48 * 60 * 60]
  );

  await ethers.provider.send(
    "evm_mine",
    []
  );

  await campaign.finalizeVote(0);

  // ============================================================
  // CAMPAIGN SHOULD NOW FAIL
  // ============================================================

  milestone =
    await campaign.getMilestone(0);

  // MilestoneState.Failed = 6
  expect(
    milestone.state
  ).to.equal(6n);

  // CampaignState.Failed = 3
 expect(
    await campaign.campaignState()
).to.equal(2n);

  // Security stake should be marked as slashed.
  expect(
    await campaign.stakeSlashed()
  ).to.equal(true);
});

  }); // 👈 THIS closes describe("Voting")
  // ============================================================
  // REFUND PROTECTION
  // ============================================================

  describe("Refund protection", function () {
    it("does not allow refunds before campaign failure", async function () {
      const {
        campaign,
        donor1,
      } = await deployCampaign();

      await campaign
        .connect(donor1)
        .donate({
          value: ethers.parseEther("1"),
        });

      await expectRevert(() =>
        campaign
          .connect(donor1)
          .claimRefund()
      );
    });
  });
});
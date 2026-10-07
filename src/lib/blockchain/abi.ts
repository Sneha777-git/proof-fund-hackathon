export const PROOFFUND_ABI = [
  // =========================================================
  // CONSTRUCTOR
  // =========================================================
  {
    type: "constructor",
    inputs: [
      {
        name: "_creator",
        type: "address",
        internalType: "address",
      },
      {
        name: "_goal",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_deadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_securityStake",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_descriptions",
        type: "string[]",
        internalType: "string[]",
      },
      {
        name: "_amounts",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "_milestoneDeadlines",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "payable",
  },

  // =========================================================
  // CAMPAIGN READ FUNCTIONS
  // =========================================================

  {
    inputs: [],
    name: "creator",
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "goal",
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "deadline",
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "securityStake",
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "totalRaised",
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "totalReleased",
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "campaignState",
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType:
          "enum ProofFundCampaign.CampaignState",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  // =========================================================
  // DONATION
  // =========================================================

  {
    inputs: [],
    name: "donate",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },

  {
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    name: "contributions",
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  // =========================================================
  // MILESTONES
  // =========================================================

  {
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    name: "milestones",
    outputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "description",
        type: "string",
        internalType: "string",
      },
      {
        name: "proofCID",
        type: "string",
        internalType: "string",
      },
      {
        name: "proofHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "voteStart",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "disputeDeadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "snapshotTotalWeight",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "yesWeight",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "noWeight",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "resubmissionCount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "state",
        type: "uint8",
        internalType:
          "enum ProofFundCampaign.MilestoneState",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  // =========================================================
  // CREATOR ACTIONS
  // =========================================================

  {
    inputs: [
      {
        name: "milestoneId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "proofCID",
        type: "string",
        internalType: "string",
      },
      {
        name: "proofHash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    name: "submitProof",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [
      {
        name: "milestoneId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    name: "openVoting",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [
      {
        name: "milestoneId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    name: "releaseMilestone",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // =========================================================
  // VOTING
  // =========================================================

  {
    inputs: [
      {
        name: "milestoneId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "approve",
        type: "bool",
        internalType: "bool",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // =========================================================
  // DISPUTES
  // =========================================================

  {
    inputs: [
      {
        name: "milestoneId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "reason",
        type: "string",
        internalType: "string",
      },
    ],
    name: "raiseDispute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // =========================================================
  // FAILURE / REFUNDS
  // =========================================================

  {
    inputs: [],
    name: "failCampaign",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [],
    name: "claimRefund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
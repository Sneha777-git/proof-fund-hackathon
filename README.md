# 🛡️ ProofFund

> **Crowdfunding where donors, not administrators, decide when money moves.**

ProofFund is a **milestone-based blockchain crowdfunding platform** that uses smart-contract escrow to give donors greater control, transparency, and accountability over how campaign funds are released.

Instead of sending donated funds directly to campaign creators, ProofFund locks the funds inside a smart contract. Creators must complete predefined milestones, submit verifiable evidence, and receive donor approval before accessing the corresponding funds.

---

## 🚨 The Problem

Traditional crowdfunding platforms often give donors limited control over how and when their contributions are released.

This creates several problems:

- Donors may not know whether promised milestones were actually completed.
- Funds can be released before sufficient progress is demonstrated.
- Refund mechanisms may be unclear or difficult to enforce.
- Centralized administrators can become a point of trust and failure.
- Campaign activity and fund movement may not be independently verifiable.

As a result, legitimate creators can struggle to demonstrate accountability while donors bear most of the risk.

---

# 💡 Our Solution

ProofFund introduces **programmable financial accountability** through blockchain-based escrow.

Each campaign is divided into predefined milestones.

```text
Donor contributes
       ↓
Funds locked in smart contract
       ↓
Creator completes milestone
       ↓
Evidence uploaded to IPFS
       ↓
Proof CID anchored on-chain
       ↓
Donors vote
       ↓
Quorum + approval threshold reached
       ↓
Dispute window
       ↓
Funds released
⭐ Key Features
🔐 Smart-Contract Escrow
Donor funds are held by the smart contract rather than being directly controlled by the campaign creator.
💰 Creator Security Stake
Creators deposit a security stake, currently designed as 10% of the campaign goal.
If the campaign fails under the defined failure conditions, the stake can be slashed and distributed to donors.
🎯 Milestone-Based Funding
Campaign funds are divided into predefined milestones.
The contract enforces:
Sum of milestone amounts = Campaign goal

🗳️ Donor-Weighted Voting
Donors vote on milestone completion using contribution-based voting power.
📸 Voting Snapshot
Voting weight is snapshotted when voting begins.
Donations made after the snapshot cannot influence the active vote.
🐋 Whale Protection
Effective voting power per wallet is capped at 25% to reduce the ability of a single donor to dominate governance.
📊 Quorum + Approval Threshold
A milestone requires both:
- Minimum 30% quorum of snapshot voting weight
- At least 60% YES among votes cast
Votes Cast / Snapshot Weight >= 30%

YES / (YES + NO) >= 60%

📁 IPFS-Based Evidence
Creators upload milestone evidence such as:
- Invoices
- Receipts
- Images
- Reports
Files are stored on IPFS through Pinata, while their content identifiers (CIDs) are anchored on-chain.
⏳ Dispute Window
Even after a milestone is approved, funds do not immediately move.
A short dispute window gives donors an opportunity to raise a dispute before funds are released.
Production configuration can use 24 hours, while the demonstration environment can use shorter configurable periods.
🔄 Pull-Based Refunds
Failed campaigns and milestones can make remaining funds refundable.
Donors claim their refunds individually through:
claimRefund()

This avoids unsafe loops over large numbers of donors.
🔥 Creator Stake Slashing
If a campaign fails under the protocol's defined failure conditions, the creator's security stake can be slashed to compensate donors.
🔎 Public Transparency
Important financial and governance state is stored on-chain and can be independently inspected through the Sepolia blockchain explorer.
🏗️ System Architecture
                         ┌─────────────────────┐
                         │        USERS        │
                         │                     │
                         │ Creator / Donors    │
                         └──────────┬──────────┘
                                    │
                              MetaMask
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      FRONTEND       │
                         │ React + TypeScript  │
                         │ Vite + ethers.js    │
                         └─────────┬───────────┘
                                   │
                  ┌────────────────┴────────────────┐
                  │                                 │
                  ▼                                 ▼
        ┌──────────────────┐              ┌────────────────────┐
        │     BACKEND      │              │   SMART CONTRACT   │
        │ Node.js + Express│              │ Solidity +         │
        │                  │              │ OpenZeppelin       │
        └────────┬─────────┘              └─────────┬──────────┘
                 │                                  │
          ┌──────┴───────┐                          │
          ▼              ▼                          ▼
     ┌──────────┐   ┌──────────┐              ┌──────────┐
     │ Supabase │   │  Pinata  │              │ Sepolia  │
     │ Metadata │   │   IPFS   │              │ Testnet  │
     └──────────┘   └──────────┘              └──────────┘

Source of Truth
The blockchain is the authoritative source for:
- Contributions
- Campaign balances
- Milestones
- Voting
- Voting snapshots
- Quorum
- Approval status
- Security stake
- Disputes
- Fund releases
- Refunds
- Campaign state
Supabase is used only for application metadata such as:
- Campaign descriptions
- Categories
- Images
- Supporting metadata
This avoids unnecessary synchronization of financial state between the database and blockchain.
🔄 Campaign Lifecycle
                    CREATE CAMPAIGN
                          │
                          ▼
                 Creator deposits
                  security stake
                          │
                          ▼
                      FUNDING
                          │
                 ┌────────┴────────┐
                 │                 │
            Goal reached       Deadline
                 │                 │
                 ▼                 ▼
               ACTIVE            FAILED
                 │                 │
                 ▼                 ▼
           Submit milestone      Refunds
                 │
                 ▼
          Upload evidence
                 │
                 ▼
                IPFS
                 │
                 ▼
          Voting snapshot
                 │
                 ▼
              VOTING
                 │
          ┌──────┴──────┐
          │             │
       Rejected       Approved
          │             │
          ▼             ▼
    One resubmission  DISPUTE WINDOW
          │             │
          │       ┌─────┴─────┐
          │       │           │
          │    Disputed    No dispute
          │       │           │
          ▼       ▼           ▼
       Retry    Frozen      RELEASE
          │
          ▼
   Second failure
          │
          ▼
   CAMPAIGN FAILED
          │
          ▼
    Stake slashed
          │
          ▼
       Refunds

🧠 Voting Mechanism
ProofFund uses donor-weighted governance while applying safeguards against common voting attacks.
Snapshot
When voting opens, eligible voting weight is captured.
Alice   → 2 ETH
Bob     → 3 ETH
Charlie → 5 ETH

Snapshot = 10 ETH

If Alice contributes another 10 ETH after the snapshot, her current contribution may increase, but it does not change the active vote's voting weight.
Quorum
At least 30% of the snapshot voting weight must participate.
Votes Cast / Snapshot Weight >= 30%

Approval
Among votes actually cast:
YES / (YES + NO) >= 60%

Both conditions must be satisfied.
Whale Cap
A single wallet's effective voting weight is capped at 25%.
This reduces the ability of a single large contributor to completely control milestone approval.
Known limitation
A 25% wallet cap does not fully prevent Sybil attacks, where one entity controls multiple wallets.
Identity verification or decentralized reputation systems are potential future extensions.
💰 Refund Mechanism
Refunds are calculated using the remaining refundable campaign balance, not the original campaign contribution total.
For example:
Original funds       = 10 ETH
Previously released  = 3 ETH
Remaining balance    = 7 ETH

If a campaign subsequently fails, the 7 ETH remaining balance is distributed proportionally among eligible donors.
Refunds are pull-based:
Donor
  ↓
claimRefund()
  ↓
Refund calculated
  ↓
ETH transferred

Each donor can claim only once.
🔥 Creator Security Stake
Creators must provide economic collateral when creating a campaign.
Example:
Campaign goal     = 10 ETH
Security stake    = 1 ETH
Stake percentage  = 10%

The stake remains locked during the campaign.
Successful campaign
Campaign succeeds
        ↓
Security stake returned

Campaign failure
Campaign fails
        ↓
Creator stake slashed
        ↓
Donors compensated

This creates an economic incentive for creators to complete their commitments.
🛡️ Security Model
ProofFund is designed around several common attack vectors.
Attack	Mitigation
Last-second vote manipulation	Voting snapshot
Whale governance	25% voting cap
Double voting	On-chain hasVoted tracking
Creator draining escrow	No arbitrary withdrawal
Premature fund release	State + deadline checks
Fake/incomplete milestone	Evidence + donor voting
Immediate release after approval	Dispute window
Double refund	refundClaimed tracking
Reentrancy	OpenZeppelin ReentrancyGuard
Invalid milestone allocation	On-chain exact-sum validation
Missed campaign goal	Campaign failure + refunds
Malicious creator behavior	Security stake + slashing
Sybil attack	Known MVP limitation


🧪 Testing
The smart contracts are tested using Hardhat.
Testing covers:
- Campaign creation
- Security stake
- Donations
- Goal validation
- Milestone accounting
- Voting
- Snapshot behavior
- Quorum
- Approval threshold
- Whale cap
- Double voting
- Proof submission
- Dispute windows
- Fund release
- Milestone rejection
- Resubmission
- Campaign failure
- Refund calculations
- Double refund prevention
- Security stake slashing
- Unauthorized actions
- Reentrancy protection
- Deadline/time-based behavior
Hardhat time manipulation is used to test campaign deadlines, voting periods, and dispute windows without waiting for real time.
🧰 Technology Stack
Frontend
- React
- TypeScript
- Vite
- ethers.js
- Tailwind CSS
- shadcn/ui
- Lucide React
- Recharts
Backend
- Node.js
- Express
- TypeScript
Blockchain
- Solidity
- Hardhat
- OpenZeppelin
- Ethereum Sepolia Testnet
- Alchemy
- MetaMask
Storage & Database
- Supabase
- IPFS
- Pinata
Testing & Development
- Hardhat
- Chai
- Solidity Coverage
- ESLint
- Prettier
- Solhint
Deployment
- Vercel
- Render
- Sepolia
📁 Project Structure
ProofFund/
│
├── contracts/
│   ├── ProofFundFactory.sol
│   ├── ProofFundCampaign.sol
│   └── interfaces/
│
├── test/
│   ├── CampaignCreation.ts
│   ├── Donations.ts
│   ├── Voting.ts
│   ├── Refunds.ts
│   ├── Disputes.ts
│   └── Security.ts
│
├── scripts/
│   ├── deploy.ts
│   └── verify.ts
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── contracts/
│       └── utils/
│
├── backend/
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       └── config/
│
├── docs/
│
├── README.md
├── .env.example
└── .gitignore

🚀 Getting Started
Prerequisites
Install:
- Node.js
- Git
- MetaMask
- A Sepolia wallet
- Sepolia test ETH
1. Clone the repository
git clone <YOUR_REPOSITORY_URL>
cd ProofFund

2. Install dependencies
npm install

Install frontend dependencies:
cd frontend
npm install

Install backend dependencies:
cd ../backend
npm install

🔑 Environment Variables
Create .env files based on .env.example.
Blockchain
SEPOLIA_RPC_URL=
PRIVATE_KEY=
ETHERSCAN_API_KEY=

Backend
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PINATA_JWT=

Frontend
VITE_CONTRACT_ADDRESS=
VITE_BACKEND_URL=
VITE_CHAIN_ID=

Never commit private keys, API secrets, JWTs, or service-role credentials.

🧪 Run Tests
From the project root:
npx hardhat test

For coverage:
npx hardhat coverage

⛓️ Compile Contracts
npx hardhat compile

🚀 Deploy to Sepolia
Configure your Sepolia RPC and deployment wallet, then:
npx hardhat run scripts/deploy.ts --network sepolia

After deployment, update the frontend contract address.
💻 Run the Frontend
cd frontend
npm run dev

⚙️ Run the Backend
cd backend
npm run dev

🌐 Deployment
Frontend
The React application can be deployed using Vercel.
Backend
The Express API can be deployed using Render or another Node-compatible cloud platform.
Smart Contracts
Contracts are deployed to Ethereum Sepolia and should be verified on the corresponding blockchain explorer.
🎬 Demo Flow
The recommended live demonstration follows two scenarios.
🟢 Successful Milestone
Create campaign
       ↓
Deposit creator security stake
       ↓
Donor contributes
       ↓
Funds locked in escrow
       ↓
Creator submits evidence
       ↓
Evidence stored on IPFS
       ↓
CID anchored on-chain
       ↓
Voting snapshot
       ↓
Donors vote
       ↓
Quorum reached
       ↓
60% approval reached
       ↓
Dispute window
       ↓
No dispute
       ↓
Funds released

🔴 Failed Milestone
Creator submits milestone
       ↓
Vote fails
       ↓
One resubmission
       ↓
Vote fails again
       ↓
Campaign fails
       ↓
Creator stake slashed
       ↓
Remaining funds become refundable
       ↓
Donor claims refund

🎯 Why Blockchain?
Blockchain is used only where it provides meaningful value.
Smart contracts provide
- Programmable escrow
- Enforced voting rules
- Automated fund release
- Refund enforcement
- Security-stake slashing
- Public financial records
IPFS provides
- Decentralized evidence storage
- Content-addressed files
- Tamper-evident proof references
Supabase provides
- Fast metadata queries
- Campaign descriptions
- Categories
- Images
- Application-level metadata
This separation keeps the architecture practical while preserving blockchain as the source of truth for financial and governance state.
⚠️ Known Limitations
ProofFund is a prototype and has several known limitations.
Sybil Resistance
A user can potentially control multiple wallets and bypass wallet-level voting caps.
Future direction: decentralized identity, reputation, or verified participant systems.
Dispute Resolution
The MVP provides a dispute mechanism but does not implement a complete decentralized arbitration protocol.
Future direction: decentralized arbitration or DAO-based resolution.
Testnet
The current demonstration operates on the Ethereum Sepolia testnet and uses test ETH.
Evidence Verification
IPFS guarantees content addressing, but storing a document does not automatically prove that the document itself is truthful.
Future versions could incorporate:
- Verified issuers
- Digital signatures
- External attestations
- Identity verification
- Automated evidence analysis
🔮 Future Scope
Potential future extensions include:
- Stablecoin donations
- Creator/donor identity verification
- Reputation systems
- Decentralized dispute resolution
- Chainlink Automation for deadline execution
- Multi-chain campaigns
- DAO governance
- Advanced fraud detection
- Mobile application
- Real-world asset/payment integrations
- Verified institutional campaign creators
🏆 Impact
ProofFund can support crowdfunding scenarios where accountability is critical, including:
- Education
- Healthcare
- Disaster relief
- Community projects
- Environmental initiatives
- Public infrastructure
- Social impact campaigns
The protocol changes crowdfunding from:
"Trust the platform to release the money."

to:
"Trust the rules, verify the evidence, and let donors control approval."

👥 Team
Team Name: Sandbox
Project: ProofFund
Institution: PCERT's Pimpri Chinchwad College of Engineering
Department: Computer Engineering
📜 License
This project is developed as an academic/hackathon prototype.
Add an appropriate open-source license before public production use.
💡 Core Idea
ProofFund turns donor trust into programmable financial accountability.

Creator stake. Milestone proof. Donor voting. Dispute protection. Transparent release.
The creator never touches money donors haven't approved.

### One important thing

Before you publish this, **replace the placeholder deployment details** with the actual:

- GitHub repository URL
- Sepolia contract address
- verified contract link
- deployed frontend URL
- deployed backend URL
- actual test/coverage numbers

And don't put fake coverage numbers in there just to make the README look impressive. Judges have a nasty habit of asking questions about things written in your own README.

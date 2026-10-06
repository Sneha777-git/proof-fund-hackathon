// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ProofFundCampaign is ReentrancyGuard {
    // =============================================================
    // ENUMS
    // =============================================================

    enum CampaignState {
        Funding,
        Active,
        Failed,
        Completed
    }

    enum MilestoneState {
        Pending,
        Voting,
        ApprovedPendingDispute,
        Disputed,
        Released,
        Rejected,
        Failed
    }

    // =============================================================
    // STRUCTS
    // =============================================================

    struct Milestone {
        uint256 amount;
        uint256 deadline;
        string description;

        string proofCID;
        bytes32 proofHash;

        uint256 voteStart;
        uint256 disputeDeadline;
        uint256 snapshotTotalWeight;

        uint256 yesWeight;
        uint256 noWeight;

        uint256 resubmissionCount;

        MilestoneState state;
    }

    // =============================================================
    // CONSTANTS
    // =============================================================

    uint256 public constant SECURITY_STAKE_BPS = 1000; // 10%

    uint256 public constant QUORUM_BPS = 3000; // 30%

    uint256 public constant APPROVAL_BPS = 6000; // 60%

    uint256 public constant MAX_VOTING_WEIGHT_BPS = 2500; // 25%

    uint256 public constant BASIS_POINTS = 10_000;

    uint256 public constant DISPUTE_WINDOW = 24 hours;

    uint256 public constant VOTING_WINDOW = 48 hours;

    // =============================================================
    // CAMPAIGN STATE
    // =============================================================

    address public immutable creator;

    uint256 public immutable goal;

    uint256 public immutable deadline;

    uint256 public immutable securityStake;

    uint256 public totalRaised;

    uint256 public totalReleased;

    uint256 public releasedMilestones;

    uint256 public currentMilestone;

    bool public stakeReturned;

    bool public stakeSlashed;

    CampaignState public campaignState;

    // =============================================================
    // DONATIONS
    // =============================================================

    mapping(address => uint256) public contributions;

    address[] public donors;

    // =============================================================
    // MILESTONES
    // =============================================================

    Milestone[] public milestones;

    mapping(uint256 => mapping(address => uint256))
        public snapshotWeight;

    mapping(uint256 => mapping(address => bool))
        public hasVoted;

    // =============================================================
    // REFUNDS
    // =============================================================

    mapping(address => bool) public refundClaimed;

    // =============================================================
    // EVENTS
    // =============================================================

    event DonationReceived(
        address indexed donor,
        uint256 amount
    );

    event ProofSubmitted(
        uint256 indexed milestoneId,
        string proofCID,
        bytes32 proofHash
    );

    event VotingOpened(
        uint256 indexed milestoneId,
        uint256 snapshotTotalWeight
    );

    event VoteCast(
        uint256 indexed milestoneId,
        address indexed voter,
        bool approve,
        uint256 weight
    );

    event MilestoneApproved(
        uint256 indexed milestoneId,
        uint256 disputeDeadline
    );

    event DisputeRaised(
        uint256 indexed milestoneId,
        address indexed donor,
        string reason
    );

    event FundsReleased(
        uint256 indexed milestoneId,
        uint256 amount
    );

    event MilestoneRejected(
        uint256 indexed milestoneId
    );

    event MilestoneFailed(
        uint256 indexed milestoneId
    );

    event CampaignFailed();

    event StakeSlashed(
        uint256 amount
    );

    event StakeReturned(
        uint256 amount
    );

    event RefundClaimed(
        address indexed donor,
        uint256 amount
    );

    event CampaignCompleted();

    // =============================================================
    // ERRORS
    // =============================================================

    error NotCreator();

    error InvalidGoal();

    error InvalidDeadline();

    error InvalidStake();

    error InvalidMilestones();

    error GoalNotReached();

    error CampaignNotFunding();

    error CampaignNotActive();

    error CampaignAlreadyFailed();

    error CampaignAlreadyCompleted();

    error CampaignNotFailed();

    error DeadlineNotReached();

    error DeadlinePassed();

    error InvalidMilestone();

    error InvalidMilestoneState();

    error InvalidMilestoneOrder();

    error InvalidProof();

    error VotingNotOpen();

    error VotingStillActive();

    error AlreadyVoted();

    error NoVotingPower();

    error QuorumNotReached();

    error ApprovalThresholdNotReached();

    error DisputeWindowActive();

    error DisputeWindowExpired();

    error AlreadyDisputed();

    error NotDonor();

    error NothingToRefund();

    error RefundAlreadyClaimed();

    error TransferFailed();

    error InvalidContribution();

    error StakeAlreadyHandled();

    // =============================================================
    // MODIFIERS
    // =============================================================

    modifier onlyCreator() {
        if (msg.sender != creator) {
            revert NotCreator();
        }

        _;
    }

    modifier validMilestone(
        uint256 milestoneId
    ) {
        if (milestoneId >= milestones.length) {
            revert InvalidMilestone();
        }

        _;
    }

    // =============================================================
    // CONSTRUCTOR
    // =============================================================

    constructor(
        address _creator,
        uint256 _goal,
        uint256 _deadline,
        uint256 _securityStake,
        string[] memory _descriptions,
        uint256[] memory _amounts,
        uint256[] memory _milestoneDeadlines
    ) payable {
        if (_creator == address(0)) {
            revert NotCreator();
        }

        if (_goal == 0) {
            revert InvalidGoal();
        }

        if (_deadline <= block.timestamp) {
            revert InvalidDeadline();
        }

        uint256 requiredStake =
            (_goal * SECURITY_STAKE_BPS) /
            BASIS_POINTS;

        if (_securityStake != requiredStake) {
            revert InvalidStake();
        }

        if (_amounts.length == 0) {
            revert InvalidMilestones();
        }

        if (
            _descriptions.length !=
                _amounts.length ||
            _milestoneDeadlines.length !=
                _amounts.length
        ) {
            revert InvalidMilestones();
        }

        uint256 milestoneTotal;

        for (
            uint256 i = 0;
            i < _amounts.length;
            i++
        ) {
            if (_amounts[i] == 0) {
                revert InvalidMilestones();
            }

            if (
                _milestoneDeadlines[i] >
                _deadline
            ) {
                revert InvalidMilestones();
            }

            if (
                i > 0 &&
                _milestoneDeadlines[i] <
                    _milestoneDeadlines[i - 1]
            ) {
                revert InvalidMilestones();
            }

            milestoneTotal += _amounts[i];

            milestones.push(
                Milestone({
                    amount: _amounts[i],
                    deadline: _milestoneDeadlines[i],
                    description: _descriptions[i],
                    proofCID: "",
                    proofHash: bytes32(0),
                    voteStart: 0,
                    disputeDeadline: 0,
                    snapshotTotalWeight: 0,
                    yesWeight: 0,
                    noWeight: 0,
                    resubmissionCount: 0,
                    state: MilestoneState.Pending
                })
            );
        }

        if (milestoneTotal != _goal) {
            revert InvalidMilestones();
        }

        if (msg.value != _securityStake) {
            revert InvalidStake();
        }

        creator = _creator;
        goal = _goal;
        deadline = _deadline;
        securityStake = _securityStake;

        campaignState =
            CampaignState.Funding;
    }

    // =============================================================
    // DONATE
    // =============================================================

    function donate()
        external
        payable
        nonReentrant
    {
        if (
            campaignState !=
            CampaignState.Funding
        ) {
            revert CampaignNotFunding();
        }

        if (block.timestamp >= deadline) {
            revert DeadlinePassed();
        }

        if (msg.value == 0) {
            revert InvalidContribution();
        }

        if (
            contributions[msg.sender] == 0
        ) {
            donors.push(msg.sender);
        }

        contributions[msg.sender] +=
            msg.value;

        totalRaised += msg.value;

        emit DonationReceived(
            msg.sender,
            msg.value
        );

        if (totalRaised >= goal) {
            campaignState =
                CampaignState.Active;
        }
    }

    // =============================================================
    // SUBMIT PROOF
    // =============================================================

function submitProof(
    uint256 milestoneId,
    string calldata proofCID,
    bytes32 proofHash
)
    external
    onlyCreator
    validMilestone(milestoneId)
{
    if (
        campaignState !=
        CampaignState.Active
    ) {
        revert CampaignNotActive();
    }

    if (
        milestoneId != currentMilestone
    ) {
        revert InvalidMilestoneOrder();
    }

    Milestone storage milestone =
        milestones[milestoneId];

    if (
        milestone.state !=
            MilestoneState.Pending &&
        milestone.state !=
            MilestoneState.Rejected
    ) {
        revert InvalidMilestoneState();
    }

    if (
        block.timestamp >
        milestone.deadline
    ) {
        revert DeadlinePassed();
    }

    if (bytes(proofCID).length == 0) {
        revert InvalidProof();
    }

    if (proofHash == bytes32(0)) {
        revert InvalidProof();
    }

    // Only increment when this is actually a resubmission
    if (
        milestone.state ==
        MilestoneState.Rejected
    ) {
        if (
            milestone.resubmissionCount >=
            1
        ) {
            revert InvalidMilestoneState();
        }

        milestone.resubmissionCount += 1;
    }

    milestone.proofCID = proofCID;
    milestone.proofHash = proofHash;

    emit ProofSubmitted(
        milestoneId,
        proofCID,
        proofHash
    );
}
    // =============================================================
    // OPEN VOTING
    // =============================================================

    function openVoting(
        uint256 milestoneId
    )
        external
        onlyCreator
        validMilestone(milestoneId)
    {
        if (
            campaignState !=
            CampaignState.Active
        ) {
            revert CampaignNotActive();
        }

        if (
            milestoneId != currentMilestone
        ) {
            revert InvalidMilestoneOrder();
        }

        Milestone storage milestone =
            milestones[milestoneId];

        if (
            milestone.state !=
                MilestoneState.Pending &&
            milestone.state !=
                MilestoneState.Rejected
        ) {
            revert InvalidMilestoneState();
        }

        if (
            bytes(milestone.proofCID).length ==
            0
        ) {
            revert InvalidProof();
        }

        if (
            block.timestamp >
            milestone.deadline
        ) {
            revert DeadlinePassed();
        }

        uint256 snapshotTotal;

        uint256 maxWeight =
            (totalRaised *
                MAX_VOTING_WEIGHT_BPS) /
            BASIS_POINTS;

        for (
            uint256 i = 0;
            i < donors.length;
            i++
        ) {
            address donor = donors[i];

            uint256 contribution =
                contributions[donor];

            uint256 weight =
                contribution;

            if (weight > maxWeight) {
                weight = maxWeight;
            }

            snapshotWeight[
                milestoneId
            ][donor] = weight;
            hasVoted[milestoneId][donor] = false;

            snapshotTotal += weight;
        }

        milestone.voteStart =
            block.timestamp;

        milestone.snapshotTotalWeight = 0;

        milestone.yesWeight = 0;

        milestone.noWeight = 0;

        milestone.state =
            MilestoneState.Voting;

        emit VotingOpened(
            milestoneId,
            snapshotTotal
        );
    }

    // =============================================================
    // VOTE
    // =============================================================

    function vote(
        uint256 milestoneId,
        bool approve
    )
        external
        validMilestone(milestoneId)
    {
        Milestone storage milestone =
            milestones[milestoneId];

        if (
            milestone.state !=
            MilestoneState.Voting
        ) {
            revert VotingNotOpen();
        }

        if (
            block.timestamp >=
            milestone.voteStart +
                VOTING_WINDOW
        ) {
            revert VotingStillActive();
        }

        if (
            hasVoted[milestoneId][msg.sender]
        ) {
            revert AlreadyVoted();
        }

        uint256 weight =
            snapshotWeight[
                milestoneId
            ][msg.sender];

        if (weight == 0) {
            revert NoVotingPower();
        }

        hasVoted[
            milestoneId
        ][msg.sender] = true;

        if (approve) {
            milestone.yesWeight += weight;
        } else {
            milestone.noWeight += weight;
        }

        emit VoteCast(
            milestoneId,
            msg.sender,
            approve,
            weight
        );
    }

    // =============================================================
    // FINALIZE VOTE
    // =============================================================

    function finalizeVote(
        uint256 milestoneId
    )
        external
        validMilestone(milestoneId)
    {
        Milestone storage milestone =
            milestones[milestoneId];

        if (
            milestone.state !=
            MilestoneState.Voting
        ) {
            revert VotingNotOpen();
        }

        if (
            block.timestamp <
            milestone.voteStart +
                VOTING_WINDOW
        ) {
            revert VotingStillActive();
        }

        uint256 totalVotes =
            milestone.yesWeight +
            milestone.noWeight;

        if (
            totalVotes *
                BASIS_POINTS <
            milestone.snapshotTotalWeight *
                QUORUM_BPS
        ) {
            revert QuorumNotReached();
        }

        if (
            milestone.yesWeight *
                BASIS_POINTS <
            totalVotes *
                APPROVAL_BPS
        ) {
            milestone.state =
                MilestoneState.Rejected;

            emit MilestoneRejected(
                milestoneId
            );

            if (
                milestone.resubmissionCount >=
                1
            ) {
                milestone.state =
                    MilestoneState.Failed;

                emit MilestoneFailed(
                    milestoneId
                );

                _failCampaign();
            }

            return;
        }

        milestone.state =
            MilestoneState
                .ApprovedPendingDispute;

        milestone.disputeDeadline =
            block.timestamp +
            DISPUTE_WINDOW;

        emit MilestoneApproved(
            milestoneId,
            milestone.disputeDeadline
        );
    }

    // =============================================================
    // RAISE DISPUTE
    // =============================================================

    function raiseDispute(
        uint256 milestoneId,
        string calldata reason
    )
        external
        validMilestone(milestoneId)
    {
        Milestone storage milestone =
            milestones[milestoneId];

        if (
            milestone.state !=
            MilestoneState
                .ApprovedPendingDispute
        ) {
            revert InvalidMilestoneState();
        }

        if (
            block.timestamp >=
            milestone.disputeDeadline
        ) {
            revert DisputeWindowExpired();
        }

        if (
            contributions[msg.sender] == 0
        ) {
            revert NotDonor();
        }

        if (bytes(reason).length == 0) {
            revert InvalidProof();
        }

        milestone.state =
            MilestoneState.Disputed;

        emit DisputeRaised(
            milestoneId,
            msg.sender,
            reason
        );
    }

    // =============================================================
    // RELEASE FUNDS
    // =============================================================

    function releaseMilestone(
        uint256 milestoneId
    )
        external
        onlyCreator
        nonReentrant
        validMilestone(milestoneId)
    {
        if (
            campaignState !=
            CampaignState.Active
        ) {
            revert CampaignNotActive();
        }

        if (
            milestoneId != currentMilestone
        ) {
            revert InvalidMilestoneOrder();
        }

        Milestone storage milestone =
            milestones[milestoneId];

        if (
            milestone.state !=
            MilestoneState
                .ApprovedPendingDispute
        ) {
            revert InvalidMilestoneState();
        }

        if (
            block.timestamp <
            milestone.disputeDeadline
        ) {
            revert DisputeWindowActive();
        }

        uint256 amount =
            milestone.amount;

        milestone.state =
            MilestoneState.Released;

        totalReleased += amount;

        releasedMilestones++;

        (
            bool success,
        ) = payable(creator).call{
            value: amount
        }("");

        if (!success) {
            revert TransferFailed();
        }

        emit FundsReleased(
            milestoneId,
            amount
        );

        if (
            releasedMilestones ==
            milestones.length
        ) {
            _completeCampaign();
        } else {
            currentMilestone++;
        }
    }

    // =============================================================
    // FAIL CAMPAIGN
    // =============================================================

    function failCampaign()
        external
    {
        if (
            campaignState ==
            CampaignState.Failed
        ) {
            revert CampaignAlreadyFailed();
        }

        if (
            campaignState ==
            CampaignState.Completed
        ) {
            revert CampaignAlreadyCompleted();
        }

        if (
            block.timestamp <
            deadline
        ) {
            revert DeadlineNotReached();
        }

        if (totalRaised >= goal) {
            revert GoalNotReached();
        }

        _failCampaign();
    }

    // =============================================================
    // REFUNDS
    // =============================================================

    function claimRefund()
        external
        nonReentrant
    {
        if (
            campaignState !=
            CampaignState.Failed
        ) {
            revert CampaignNotFailed();
        }

        if (
            refundClaimed[msg.sender]
        ) {
            revert RefundAlreadyClaimed();
        }

        uint256 contribution =
            contributions[msg.sender];

        if (contribution == 0) {
            revert NothingToRefund();
        }

        uint256 refundablePool =
            address(this).balance;

        uint256 refund =
            (refundablePool *
                contribution) /
            totalRaised;

        if (refund == 0) {
            revert NothingToRefund();
        }

        refundClaimed[msg.sender] = true;

        (
            bool success,
        ) = payable(msg.sender).call{
            value: refund
        }("");

        if (!success) {
            revert TransferFailed();
        }

        emit RefundClaimed(
            msg.sender,
            refund
        );
    }

    // =============================================================
    // INTERNAL FAILURE
    // =============================================================

    function _failCampaign()
        internal
    {
        campaignState =
            CampaignState.Failed;

        emit CampaignFailed();

        if (
            !stakeSlashed &&
            !stakeReturned
        ) {
            stakeSlashed = true;

            emit StakeSlashed(
                securityStake
            );
        }
    }

    // =============================================================
    // INTERNAL COMPLETION
    // =============================================================

    function _completeCampaign()
        internal
    {
        if (
            totalReleased != goal
        ) {
            revert InvalidMilestones();
        }

        campaignState =
            CampaignState.Completed;

        if (
            !stakeReturned &&
            !stakeSlashed
        ) {
            stakeReturned = true;

            (
                bool success,
            ) = payable(creator).call{
                value: securityStake
            }("");

            if (!success) {
                revert TransferFailed();
            }

            emit StakeReturned(
                securityStake
            );
        }

        emit CampaignCompleted();
    }

    // =============================================================
    // VIEW FUNCTIONS
    // =============================================================

    function getMilestoneCount()
        external
        view
        returns (uint256)
    {
        return milestones.length;
    }

    function getDonorCount()
        external
        view
        returns (uint256)
    {
        return donors.length;
    }

    function getMilestone(
        uint256 milestoneId
    )
        external
        view
        validMilestone(milestoneId)
        returns (Milestone memory)
    {
        return milestones[milestoneId];
    }

    function getDonors()
        external
        view
        returns (address[] memory)
    {
        return donors;
    }
}
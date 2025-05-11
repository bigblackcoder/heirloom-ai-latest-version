// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title Governance Module
 * @dev Handles proposal creation, voting, and governance states with enhanced security and features.
 */
contract GovernanceModule {
    address public admin;
    address public pendingAdmin;
    uint256 public minimumParticipation;
    uint256 public constant MAX_DURATION = 30 days;
    uint256 public proposalCount;

    event ProposalCreated(
        uint256 indexed proposalId, 
        string description, 
        string category, 
        uint256 deadline,
        address creator
    );
    event ProposalVoted(
        uint256 indexed proposalId, 
        address indexed voter, 
        uint256 weight,
        uint256 newTotalVotes
    );
    event ProposalClosed(
        uint256 indexed proposalId, 
        bool passed, 
        uint256 finalVoteCount
    );
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);
    event MinimumParticipationUpdated(uint256 oldValue, uint256 newValue);

    enum ProposalState { Open, Closed, Passed, Failed }

    struct Proposal {
        string description;
        string category;
        uint256 voteCount;
        uint256 deadline;
        ProposalState state;
        address creator;
        uint256 createdAt;
        mapping(address => bool) votes;
    }

    mapping(uint256 => Proposal) public proposals;

    error Unauthorized();
    error InvalidProposalId();
    error ProposalNotOpen();
    error AlreadyVoted();
    error InvalidDuration();
    error VotingPeriodNotEnded();
    error InvalidParticipation();
    error InvalidAddress();

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    modifier validProposalId(uint256 proposalId) {
        if (proposalId >= proposalCount) revert InvalidProposalId();
        _;
    }

    constructor(address _admin, uint256 _minimumParticipation) {
        if (_admin == address(0)) revert InvalidAddress();
        if (_minimumParticipation == 0) revert InvalidParticipation();
        
        admin = _admin;
        minimumParticipation = _minimumParticipation;
    }

    function createProposal(
        string memory description,
        string memory category,
        uint256 duration
    ) external onlyAdmin {
        if (duration == 0 || duration > MAX_DURATION) revert InvalidDuration();

        uint256 proposalId = proposalCount++;
        uint256 deadline = block.timestamp + duration;

        Proposal storage newProposal = proposals[proposalId];
        newProposal.description = description;
        newProposal.category = category;
        newProposal.deadline = deadline;
        newProposal.state = ProposalState.Open;
        newProposal.creator = msg.sender;
        newProposal.createdAt = block.timestamp;

        emit ProposalCreated(
            proposalId,
            description,
            category,
            deadline,
            msg.sender
        );
    }

    function voteOnProposal(
        uint256 proposalId,
        address voter,
        uint256 votingWeight
    ) external 
        onlyAdmin 
        validProposalId(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.state != ProposalState.Open) revert ProposalNotOpen();
        if (proposal.votes[voter]) revert AlreadyVoted();
        if (block.timestamp > proposal.deadline) revert VotingPeriodNotEnded();

        proposal.votes[voter] = true;
        proposal.voteCount += votingWeight;

        emit ProposalVoted(
            proposalId,
            voter,
            votingWeight,
            proposal.voteCount
        );
    }

    function closeProposal(uint256 proposalId) external 
        onlyAdmin 
        validProposalId(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.state != ProposalState.Open) revert ProposalNotOpen();
        if (block.timestamp <= proposal.deadline) revert VotingPeriodNotEnded();

        proposal.state = proposal.voteCount >= minimumParticipation 
            ? ProposalState.Passed 
            : ProposalState.Failed;

        emit ProposalClosed(
            proposalId,
            proposal.state == ProposalState.Passed,
            proposal.voteCount
        );
    }

    function updateMinimumParticipation(uint256 newMinimum) external onlyAdmin {
        if (newMinimum == 0) revert InvalidParticipation();
        
        uint256 oldValue = minimumParticipation;
        minimumParticipation = newMinimum;
        
        emit MinimumParticipationUpdated(oldValue, newMinimum);
    }

    function getProposal(uint256 proposalId) external view 
        validProposalId(proposalId)
        returns (
            string memory description,
            string memory category,
            uint256 voteCount,
            uint256 deadline,
            ProposalState state,
            address creator,
            uint256 createdAt
        ) 
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.description,
            proposal.category,
            proposal.voteCount,
            proposal.deadline,
            proposal.state,
            proposal.creator,
            proposal.createdAt
        );
    }

    function hasVoted(uint256 proposalId, address voter) external view 
        validProposalId(proposalId)
        returns (bool) 
    {
        return proposals[proposalId].votes[voter];
    }
}

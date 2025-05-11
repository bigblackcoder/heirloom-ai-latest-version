// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract PRVNToken is
    ERC721URIStorage,
    AccessControl,
    Pausable,
    ReentrancyGuard
{
    using EnumerableSet for EnumerableSet.AddressSet;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    uint256 private constant GRACE_PERIOD = 900;
    uint256 private constant MAX_HISTORY_LENGTH = 1000;
    uint256 private constant MAX_BATCH_SIZE = 100;
    uint256 private constant MAX_GAS_FOR_ACCESS_CHECK = 5000000;

    mapping(uint256 => bool) public datasetIssued;
    mapping(uint256 => mapping(address => bool)) public datasetAccess;
    mapping(uint256 => mapping(address => uint256)) public accessExpiration;
    mapping(uint256 => address) public accessManagers;
    mapping(uint256 => EnumerableSet.AddressSet) private activeUsers;
    mapping(uint256 => uint256[]) public hitToPrvnLinks;

    struct EventHistory {
        address user;
        uint256 timestamp;
        string eventType;
        string details;
    }

    mapping(uint256 => EventHistory[]) private eventHistories;
    uint256 private _tokenCounter;

    event PRVNIssued(address indexed to, uint256 tokenId, string metadataURI);
    event AccessGranted(
        uint256 indexed tokenId,
        address indexed user,
        uint256 expirationTime
    );
    event AccessRevoked(uint256 indexed tokenId, address indexed user);
    event MetadataUpdated(uint256 indexed tokenId, string newMetadataURI);
    event PRVNBurned(uint256 indexed tokenId);
    event HITLinkedToPRVN(uint256 indexed hitTokenId, uint256 prvnTokenId);
    event ManagerUpdated(uint256 indexed tokenId, address indexed manager);

    constructor() ERC721("Provenance Token", "PRVN") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    modifier gasLimited() {
        require(gasleft() >= MAX_GAS_FOR_ACCESS_CHECK, "Insufficient gas");
        _;
    }

    modifier onlyAccessManager(uint256 tokenId) {
        require(
            msg.sender == accessManagers[tokenId] ||
                hasRole(ADMIN_ROLE, msg.sender) ||
                msg.sender == ownerOf(tokenId),
            "Not authorized"
        );
        _;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function issuePRVN(
        address to,
        uint256 datasetId,
        string calldata metadataURI
    ) external onlyRole(ADMIN_ROLE) whenNotPaused nonReentrant {
        require(to != address(0), "Zero address");
        require(!datasetIssued[datasetId], "Already issued");

        uint256 tokenId = _tokenCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        datasetIssued[datasetId] = true;
        emit PRVNIssued(to, tokenId, metadataURI);
    }

    function grantAccess(
        uint256 tokenId,
        address user,
        uint256 duration
    )
        external
        onlyAccessManager(tokenId)
        whenNotPaused
        nonReentrant
        gasLimited
    {
        require(user != address(0), "Zero address");
        require(duration >= GRACE_PERIOD, "Duration too short");
        require(_ownerOf(tokenId) != address(0), "Token doesn't exist");

        uint256 expiration = block.timestamp + duration;
        datasetAccess[tokenId][user] = true;
        accessExpiration[tokenId][user] = expiration;
        EnumerableSet.add(activeUsers[tokenId], user);

        logEvent(tokenId, user, "GRANT", "Access granted");
        emit AccessGranted(tokenId, user, expiration);
    }

    function getUsersWithAccess(uint256 tokenId)
        public
        view
        returns (address[] memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token doesn't exist");

        uint256 setSize = EnumerableSet.length(activeUsers[tokenId]);
        address[] memory validUsers = new address[](setSize);
        uint256 validCount = 0;

        for (uint256 i = 0; i < setSize; i++) {
            address user = EnumerableSet.at(activeUsers[tokenId], i);
            if (
                datasetAccess[tokenId][user] &&
                block.timestamp <= accessExpiration[tokenId][user]
            ) {
                validUsers[validCount++] = user;
            }
        }

        address[] memory result = new address[](validCount);
        for (uint256 i = 0; i < validCount; i++) {
            result[i] = validUsers[i];
        }

        return result;
    }

    function getEventHistory(uint256 tokenId)
        external
        view
        returns (EventHistory[] memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token doesn't exist");
        return eventHistories[tokenId];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        if (paused()) {
            revert("Transfers paused");
        }
        require(batchSize <= MAX_BATCH_SIZE, "Batch size exceeds limit");
        if (from != address(0) && to != address(0)) {
            revert("Non-transferable");
        }
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function logEvent(
        uint256 tokenId,
        address user,
        string memory eventType,
        string memory details
    ) internal {
        require(
            eventHistories[tokenId].length < MAX_HISTORY_LENGTH,
            "History limit"
        );

        eventHistories[tokenId].push(
            EventHistory({
                user: user,
                timestamp: block.timestamp,
                eventType: eventType,
                details: details
            })
        );
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
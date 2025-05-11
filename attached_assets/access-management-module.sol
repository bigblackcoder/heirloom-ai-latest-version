// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessManagement {
    address public owner;
    uint256 public constant MAX_DURATION = 365 days;
    
    mapping(uint256 => mapping(address => bool)) public datasetAccess;
    mapping(uint256 => mapping(address => uint256)) public accessExpiration;
    mapping(uint256 => address) public accessManagers;

    event AccessGranted(uint256 indexed tokenId, address indexed user);
    event AccessRevoked(uint256 indexed tokenId, address indexed user);
    event TimedAccessGranted(uint256 indexed tokenId, address indexed user, uint256 expiration);
    event AccessManagerUpdated(uint256 indexed tokenId, address indexed manager);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier onlyAccessManager(uint256 tokenId) {
        require(msg.sender == accessManagers[tokenId], "Caller is not the access manager");
        _;
    }

    function grantAccess(uint256 tokenId, address user) external onlyAccessManager(tokenId) {
        require(user != address(0), "Invalid address: zero address");
        datasetAccess[tokenId][user] = true;
        // Clear any timed access
        accessExpiration[tokenId][user] = 0;
        emit AccessGranted(tokenId, user);
    }

    function revokeAccess(uint256 tokenId, address user) external onlyAccessManager(tokenId) {
        require(
            datasetAccess[tokenId][user] || 
            block.timestamp <= accessExpiration[tokenId][user],
            "No active access"
        );
        datasetAccess[tokenId][user] = false;
        accessExpiration[tokenId][user] = 0;
        emit AccessRevoked(tokenId, user);
    }

    function grantTimedAccess(uint256 tokenId, address user, uint256 duration) external onlyAccessManager(tokenId) {
        require(user != address(0), "Invalid address: zero address");
        require(duration > 0 && duration <= MAX_DURATION, "Invalid duration");
        
        datasetAccess[tokenId][user] = false;
        uint256 expiration = block.timestamp + duration;
        accessExpiration[tokenId][user] = expiration;
        emit TimedAccessGranted(tokenId, user, expiration);
    }

    function hasAccess(uint256 tokenId, address user) external view returns (bool) {
        return datasetAccess[tokenId][user] || 
               (accessExpiration[tokenId][user] > 0 && block.timestamp <= accessExpiration[tokenId][user]);
    }

    function setAccessManager(uint256 tokenId, address manager) external onlyOwner {
        require(manager != address(0), "Invalid manager address");
        accessManagers[tokenId] = manager;
        emit AccessManagerUpdated(tokenId, manager);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract HITLinking {
    uint256 public constant MAX_LINKS = 100;
    address public owner;
    
    mapping(uint256 => uint256[]) public hitToPrvnLinks;
    mapping(uint256 => bool) public validHitTokens;
    mapping(uint256 => bool) public validPrvnTokens;
    mapping(uint256 => mapping(uint256 => bool)) public isLinked;
    
    event HITLinkedToPRVN(uint256 indexed hitTokenId, uint256 indexed prvnTokenId);
    event TokenValidationSet(uint256 indexed tokenId, bool isHit, bool valid);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    function setValidToken(uint256 tokenId, bool isHit, bool valid) external onlyOwner {
        if(isHit) {
            validHitTokens[tokenId] = valid;
        } else {
            validPrvnTokens[tokenId] = valid;
        }
        emit TokenValidationSet(tokenId, isHit, valid);
    }
    
    function linkHITToPRVN(uint256 hitTokenId, uint256 prvnTokenId) external onlyOwner {
        require(validHitTokens[hitTokenId], "Invalid HIT token");
        require(validPrvnTokens[prvnTokenId], "Invalid PRVN token");
        require(!isLinked[hitTokenId][prvnTokenId], "Already linked");
        require(hitToPrvnLinks[hitTokenId].length < MAX_LINKS, "Max links reached");
        
        hitToPrvnLinks[hitTokenId].push(prvnTokenId);
        isLinked[hitTokenId][prvnTokenId] = true;
        emit HITLinkedToPRVN(hitTokenId, prvnTokenId);
    }
    
    function getPRVNLinkedToHIT(uint256 hitTokenId, uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory links, uint256 total) 
    {
        require(validHitTokens[hitTokenId], "Invalid HIT token");
        require(offset < hitToPrvnLinks[hitTokenId].length, "Invalid offset");
        
        uint256 size = hitToPrvnLinks[hitTokenId].length - offset;
        if(size > limit) size = limit;
        
        links = new uint256[](size);
        for(uint256 i = 0; i < size; i++) {
            links[i] = hitToPrvnLinks[hitTokenId][offset + i];
        }
        
        return (links, hitToPrvnLinks[hitTokenId].length);
    }
}

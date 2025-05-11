// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SimpleHIT is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private tokenCounter;
    
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant REVOKER_ROLE = keccak256("REVOKER_ROLE");
    
    mapping(address => uint256) public userToTokenId;
    mapping(uint256 => bytes32[]) public tokenToDataIds;
    
    event HITIssued(address indexed to, uint256 indexed tokenId);
    event HITRevoked(address indexed user, uint256 indexed tokenId);
    
    constructor() ERC721("Simple Heirloom Identity Token", "SHIT") {
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(REVOKER_ROLE, msg.sender);
    }
    
    function issueHIT(address to, string memory metadataURI) external onlyRole(ISSUER_ROLE) {
        require(to != address(0), "Invalid address");
        require(userToTokenId[to] == 0, "HIT already issued");
        
        tokenCounter.increment();
        uint256 tokenId = tokenCounter.current();
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        userToTokenId[to] = tokenId;
        
        emit HITIssued(to, tokenId);
    }
    
    function revokeHIT(address user) external onlyRole(REVOKER_ROLE) {
        uint256 tokenId = userToTokenId[user];
        require(tokenId != 0, "No HIT issued to this user");
        
        _burn(tokenId);
        delete userToTokenId[user];
        delete tokenToDataIds[tokenId];
        
        emit HITRevoked(user, tokenId);
    }
    
    function hasIdentityToken(address user) external view returns (bool) {
        return userToTokenId[user] != 0;
    }
    
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address owner = _ownerOf(tokenId);
        require(to == address(0) || auth == owner || isApprovedForAll(owner, auth), 
            "HIT tokens are non-transferable");
        return super._update(to, tokenId, auth);
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

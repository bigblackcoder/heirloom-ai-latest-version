// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IHIT
 * @dev Interface for the Heirloom Identity Token (HIT) contract
 */
interface IHIT {
    /**
     * @dev Returns the token ID for a given user address
     * @param user address of the user to query
     * @return uint256 token ID assigned to the user, or 0 if none
     */
    function userToTokenId(address user) external view returns (uint256);
    
    /**
     * @dev Checks if a user has an identity token
     * @param user address of the user to check
     * @return bool whether the user has an identity token
     */
    function hasIdentityToken(address user) external view returns (bool);
    
    /**
     * @dev Issues a new HIT token to a user
     * @param to address of the recipient
     * @param metadataURI string URI pointing to the token's metadata
     */
    function issueHIT(address to, string memory metadataURI) external;
    
    /**
     * @dev Revokes a HIT token from a user
     * @param user address of the user whose token will be revoked
     */
    function revokeHIT(address user) external;
}
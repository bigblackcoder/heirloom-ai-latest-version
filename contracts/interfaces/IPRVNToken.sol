// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IPRVNToken
 * @dev Interface for the PRVN Token contract
 */
interface IPRVNToken {
   /**
    * @dev Returns the owner of the specified token ID
    * @param tokenId uint256 ID of the token to query the owner of
    * @return address currently marked as the owner of the given token ID
    */
   function ownerOf(uint256 tokenId) external view returns (address);
   
   /**
    * @dev Check if a user has access to a token
    * @param tokenId uint256 ID of the token to check access for
    * @param user address of the user to check
    * @return bool whether the user has access
    */
   function hasAccess(uint256 tokenId, address user) external view returns (bool);
   
   /**
    * @dev Grant access to a token
    * @param tokenId uint256 ID of the token to grant access to
    * @param user address of the user to grant access
    */
   function grantAccess(uint256 tokenId, address user) external;
   
   /**
    * @dev Revoke access to a token
    * @param tokenId uint256 ID of the token to revoke access from
    * @param user address of the user to revoke access
    */
   function revokeAccess(uint256 tokenId, address user) external;
   
   /**
    * @dev Grant timed access to a token
    * @param tokenId uint256 ID of the token to grant access to
    * @param user address of the user to grant access
    * @param duration uint256 duration of the access in seconds
    */
   function grantTimedAccess(uint256 tokenId, address user, uint256 duration) external;
}
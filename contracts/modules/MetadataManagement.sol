// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

abstract contract MetadataManagement is ERC721URIStorage {
   using Strings for uint256;

   uint256 public constant MAX_URI_LENGTH = 2048;
   mapping(uint256 => uint256) public lastUpdateTime;
   mapping(uint256 => uint256) public updateCount;
   uint256 public constant MAX_UPDATES_PER_DAY = 5;
   
   event MetadataUpdated(uint256 indexed tokenId, string newMetadataURI, uint256 updateCount);
   
   function updateMetadata(uint256 tokenId, string calldata newMetadataURI) external {
       require(ownerOf(tokenId) == msg.sender, "Not token owner");
       require(bytes(newMetadataURI).length > 0 && bytes(newMetadataURI).length <= MAX_URI_LENGTH, 
               "Invalid URI length");
       
       uint256 daysSinceLastUpdate = (block.timestamp - lastUpdateTime[tokenId]) / 1 days;
       if (daysSinceLastUpdate >= 1) {
           updateCount[tokenId] = 0;
       }
       
       require(updateCount[tokenId] < MAX_UPDATES_PER_DAY, "Update limit exceeded");
       
       lastUpdateTime[tokenId] = block.timestamp;
       updateCount[tokenId]++;
       
       _setTokenURI(tokenId, newMetadataURI);
       emit MetadataUpdated(tokenId, newMetadataURI, updateCount[tokenId]);
   }

   function getMetadataHistory(uint256 tokenId) external view returns (
       uint256 totalUpdates,
       uint256 lastUpdate,
       uint256 updatesRemaining
   ) {
       uint256 daysSinceLastUpdate = (block.timestamp - lastUpdateTime[tokenId]) / 1 days;
       uint256 currentDayUpdates = daysSinceLastUpdate >= 1 ? 0 : updateCount[tokenId];
       
       return (
           updateCount[tokenId],
           lastUpdateTime[tokenId],
           MAX_UPDATES_PER_DAY - currentDayUpdates
       );
   }
}
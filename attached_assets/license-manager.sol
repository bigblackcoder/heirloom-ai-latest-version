// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IPRVNToken {
   function ownerOf(uint256 tokenId) external view returns (address);
   function hasAccess(uint256 tokenId, address user) external view returns (bool);
   function grantAccess(uint256 tokenId, address user) external;
   function revokeAccess(uint256 tokenId, address user) external;
   function grantTimedAccess(uint256 tokenId, address user, uint256 duration) external;
}

contract LicenseManager is Ownable {
   uint256 public constant MAX_ROYALTY = 5000; // 50%
   uint256 public constant MAX_ACCESS_LOGS = 1000;
   
   IPRVNToken public prvnTokenContract;
   mapping(uint256 => uint256) public royalties;
   mapping(uint256 => uint256) public licenseFees;
   
   struct AccessLog {
       address licensee;
       uint256 timestamp;
       bool granted;
   }
   
   mapping(uint256 => AccessLog[]) private accessLogs;
   mapping(uint256 => mapping(address => bool)) public activeLicenses;
   
   event LicenseGranted(uint256 indexed tokenId, address indexed licensee);
   event LicenseRevoked(uint256 indexed tokenId, address indexed licensee);
   event RoyaltySet(uint256 indexed tokenId, uint256 percentage);
   event LicenseFeeSet(uint256 indexed tokenId, uint256 fee);
   
   constructor(address _prvnTokenContract) Ownable(msg.sender) {
       require(_prvnTokenContract != address(0), "Invalid contract address");
       prvnTokenContract = IPRVNToken(_prvnTokenContract);
   }

   function setRoyalty(uint256 tokenId, uint256 percentage) external {
       require(msg.sender == prvnTokenContract.ownerOf(tokenId), "Not token owner");
       require(percentage <= MAX_ROYALTY, "Royalty too high");
       royalties[tokenId] = percentage;
       emit RoyaltySet(tokenId, percentage);
   }

   function setLicenseFee(uint256 tokenId, uint256 fee) external {
       require(msg.sender == prvnTokenContract.ownerOf(tokenId), "Not token owner");
       licenseFees[tokenId] = fee;
       emit LicenseFeeSet(tokenId, fee);
   }

   function grantLicense(uint256 tokenId) external payable {
       require(!activeLicenses[tokenId][msg.sender], "License already granted");
       require(msg.value >= licenseFees[tokenId], "Insufficient fee");
       
       activeLicenses[tokenId][msg.sender] = true;
       prvnTokenContract.grantAccess(tokenId, msg.sender);
       
       _addAccessLog(tokenId, msg.sender, true);
       
       uint256 royaltyAmount = (msg.value * royalties[tokenId]) / 10000;
       if(royaltyAmount > 0) {
           (bool success, ) = prvnTokenContract.ownerOf(tokenId).call{value: royaltyAmount}("");
           require(success, "Royalty transfer failed");
       }
       
       emit LicenseGranted(tokenId, msg.sender);
   }

   function revokeLicense(uint256 tokenId, address licensee) external {
       require(msg.sender == prvnTokenContract.ownerOf(tokenId), "Not token owner");
       require(activeLicenses[tokenId][licensee], "No active license");
       
       activeLicenses[tokenId][licensee] = false;
       prvnTokenContract.revokeAccess(tokenId, licensee);
       
       _addAccessLog(tokenId, licensee, false);
       emit LicenseRevoked(tokenId, licensee);
   }

   function getAccessLogs(uint256 tokenId, uint256 offset, uint256 limit) 
       external 
       view 
       returns (AccessLog[] memory logs, uint256 total) 
   {
       require(offset < accessLogs[tokenId].length, "Invalid offset");
       
       uint256 size = accessLogs[tokenId].length - offset;
       if(size > limit) size = limit;
       
       logs = new AccessLog[](size);
       for(uint256 i = 0; i < size; i++) {
           logs[i] = accessLogs[tokenId][offset + i];
       }
       
       return (logs, accessLogs[tokenId].length);
   }

   function _addAccessLog(uint256 tokenId, address licensee, bool granted) private {
       AccessLog[] storage logs = accessLogs[tokenId];
       if(logs.length >= MAX_ACCESS_LOGS) {
           for(uint i = 0; i < logs.length - 1; i++) {
               logs[i] = logs[i + 1];
           }
           logs.pop();
       }
       
       logs.push(AccessLog({
           licensee: licensee,
           timestamp: block.timestamp,
           granted: granted
       }));
   }
}

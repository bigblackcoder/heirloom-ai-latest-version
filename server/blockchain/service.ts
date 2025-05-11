/**
 * Blockchain Service
 * 
 * This service simulates blockchain interactions for the Heirloom Identity Platform
 * It mocks the behavior of smart contracts without requiring an actual blockchain connection
 */

import { v4 as uuidv4 } from 'uuid';

// Simulated blockchain state
interface HITToken {
  tokenId: string;
  owner: string;
  metadataURI: string;
  issuedAt: number;
  dataIds: string[];
}

interface PRVNToken {
  tokenId: string;
  owner: string;
  metadataURI: string;
  datasetId: string;
  issuedAt: number;
  accessList: {
    [address: string]: {
      hasAccess: boolean;
      expiration: number | null;
    }
  };
}

interface License {
  tokenId: string;
  licensee: string;
  fee: number;
  royaltyPercentage: number;
  grantedAt: number;
  active: boolean;
}

interface ContractRegistry {
  address: string;
  name: string;
  symbol: string;
  chainId: number;
  deployedAt: number;
  contractType: 'HIT' | 'PRVN' | 'LICENSE';
}

// Simulated blockchain state storage
class BlockchainState {
  private hitTokens: Map<string, HITToken> = new Map();
  private prvnTokens: Map<string, PRVNToken> = new Map();
  private licenses: Map<string, License> = new Map();
  private hitByUser: Map<string, string> = new Map();
  private contracts: Map<string, ContractRegistry> = new Map();
  private hitToPrvnLinks: Map<string, string[]> = new Map();

  // Contract addresses on Polygon Amoy Testnet (chainId: 80002)
  readonly HIT_CONTRACT_ADDRESS = "0x4a79551973Aa98f11d13d59b91C5A5c4cF869335";
  readonly PRVN_CONTRACT_ADDRESS = "0x5b98D84538EE3319AfC09D88C6b7c0eB3bf9403B";
  readonly LICENSE_CONTRACT_ADDRESS = "0x8E2f0C77b11d572056826bB35E8ACF150E586d5c";
  readonly CHAIN_ID = 80002; // Polygon Amoy Testnet

  constructor() {
    // Register default contracts
    this.registerContract({
      address: this.HIT_CONTRACT_ADDRESS,
      name: "Heirloom Identity Token",
      symbol: "HIT",
      chainId: this.CHAIN_ID,
      deployedAt: Date.now(),
      contractType: 'HIT'
    });

    this.registerContract({
      address: this.PRVN_CONTRACT_ADDRESS,
      name: "Provenance Token",
      symbol: "PRVN",
      chainId: this.CHAIN_ID,
      deployedAt: Date.now(),
      contractType: 'PRVN'
    });

    this.registerContract({
      address: this.LICENSE_CONTRACT_ADDRESS,
      name: "License Manager",
      symbol: "LICENSE",
      chainId: this.CHAIN_ID,
      deployedAt: Date.now(),
      contractType: 'LICENSE'
    });
  }

  // HIT Token methods
  issueHIT(owner: string, metadataURI: string): HITToken {
    // Check if user already has a token
    if (this.hitByUser.has(owner)) {
      throw new Error("User already has an identity token");
    }

    const tokenId = uuidv4();
    const hitToken: HITToken = {
      tokenId,
      owner,
      metadataURI,
      issuedAt: Date.now(),
      dataIds: []
    };

    this.hitTokens.set(tokenId, hitToken);
    this.hitByUser.set(owner, tokenId);

    return hitToken;
  }

  revokeHIT(owner: string): void {
    const tokenId = this.hitByUser.get(owner);
    if (!tokenId) {
      throw new Error("No HIT found for this user");
    }

    this.hitTokens.delete(tokenId);
    this.hitByUser.delete(owner);
  }

  hasHIT(owner: string): boolean {
    return this.hitByUser.has(owner);
  }

  getHIT(tokenId: string): HITToken | undefined {
    return this.hitTokens.get(tokenId);
  }

  getHITByOwner(owner: string): HITToken | undefined {
    const tokenId = this.hitByUser.get(owner);
    if (!tokenId) return undefined;
    return this.hitTokens.get(tokenId);
  }

  // PRVN Token methods
  issuePRVN(owner: string, datasetId: string, metadataURI: string): PRVNToken {
    const tokenId = uuidv4();
    const prvnToken: PRVNToken = {
      tokenId,
      owner,
      metadataURI,
      datasetId,
      issuedAt: Date.now(),
      accessList: {}
    };

    this.prvnTokens.set(tokenId, prvnToken);
    return prvnToken;
  }

  grantAccess(tokenId: string, user: string, duration?: number): void {
    const token = this.prvnTokens.get(tokenId);
    if (!token) {
      throw new Error("PRVN token not found");
    }

    token.accessList[user] = {
      hasAccess: true,
      expiration: duration ? Date.now() + duration * 1000 : null
    };
  }

  revokeAccess(tokenId: string, user: string): void {
    const token = this.prvnTokens.get(tokenId);
    if (!token) {
      throw new Error("PRVN token not found");
    }

    if (token.accessList[user]) {
      token.accessList[user].hasAccess = false;
      token.accessList[user].expiration = null;
    }
  }

  hasAccess(tokenId: string, user: string): boolean {
    const token = this.prvnTokens.get(tokenId);
    if (!token) return false;

    const access = token.accessList[user];
    if (!access) return false;

    if (!access.hasAccess) return false;
    if (access.expiration && access.expiration < Date.now()) return false;

    return true;
  }

  getPRVN(tokenId: string): PRVNToken | undefined {
    return this.prvnTokens.get(tokenId);
  }

  // License methods
  createLicense(tokenId: string, licensee: string, fee: number, royaltyPercentage: number): License {
    const licenseId = uuidv4();
    const license: License = {
      tokenId,
      licensee,
      fee,
      royaltyPercentage,
      grantedAt: Date.now(),
      active: true
    };

    this.licenses.set(licenseId, license);
    // Also grant access to the underlying PRVN
    this.grantAccess(tokenId, licensee);

    return license;
  }

  revokeLicense(licenseId: string): void {
    const license = this.licenses.get(licenseId);
    if (!license) {
      throw new Error("License not found");
    }

    license.active = false;
    // Also revoke access to the underlying PRVN
    this.revokeAccess(license.tokenId, license.licensee);
  }

  // HIT-PRVN Linking
  linkHITToPRVN(hitTokenId: string, prvnTokenId: string): void {
    const hit = this.hitTokens.get(hitTokenId);
    const prvn = this.prvnTokens.get(prvnTokenId);

    if (!hit || !prvn) {
      throw new Error("Invalid token IDs");
    }

    if (!this.hitToPrvnLinks.has(hitTokenId)) {
      this.hitToPrvnLinks.set(hitTokenId, []);
    }

    const links = this.hitToPrvnLinks.get(hitTokenId)!;
    if (!links.includes(prvnTokenId)) {
      links.push(prvnTokenId);
    }
  }

  getPRVNsLinkedToHIT(hitTokenId: string): string[] {
    return this.hitToPrvnLinks.get(hitTokenId) || [];
  }

  // Contract registry
  registerContract(contract: ContractRegistry): void {
    this.contracts.set(contract.address, contract);
  }

  getContract(address: string): ContractRegistry | undefined {
    return this.contracts.get(address);
  }

  verifyOnChain(tokenId: string, type: 'HIT' | 'PRVN'): { 
    verified: boolean, 
    contractAddress: string, 
    owner: string | null, 
    tokenId: string, 
    chainId: number 
  } {
    if (type === 'HIT') {
      const token = this.hitTokens.get(tokenId);
      if (!token) {
        return { 
          verified: false, 
          contractAddress: this.HIT_CONTRACT_ADDRESS, 
          owner: null, 
          tokenId, 
          chainId: this.CHAIN_ID 
        };
      }
      return { 
        verified: true, 
        contractAddress: this.HIT_CONTRACT_ADDRESS, 
        owner: token.owner, 
        tokenId, 
        chainId: this.CHAIN_ID 
      };
    } else {
      const token = this.prvnTokens.get(tokenId);
      if (!token) {
        return { 
          verified: false, 
          contractAddress: this.PRVN_CONTRACT_ADDRESS, 
          owner: null, 
          tokenId, 
          chainId: this.CHAIN_ID 
        };
      }
      return { 
        verified: true, 
        contractAddress: this.PRVN_CONTRACT_ADDRESS, 
        owner: token.owner, 
        tokenId, 
        chainId: this.CHAIN_ID 
      };
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainState();
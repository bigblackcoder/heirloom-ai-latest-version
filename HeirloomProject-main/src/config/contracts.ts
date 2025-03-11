import { ethers } from 'ethers';
import SimpleHIT_ABI from '../abis/SimpleHIT.json';
import PRVNToken_ABI from '../abis/PRVNToken.json';
import dotenv from 'dotenv';

dotenv.config();

interface GasSettings {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gasPrice?: bigint | null;
  lastBaseFeePerGas?: bigint | null;
}

interface HITContractMethods {
  issueHIT(to: string, metadataURI: string, overrides?: any): Promise<ethers.ContractTransaction>;
  hasIdentityToken(user: string): Promise<boolean>;
}

type HITContract = ethers.Contract & HITContractMethods;

export class ContractConfig {
  public readonly provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private defaultGasSettings: GasSettings;

  constructor() {
    // Initialize provider with Polygon Amoy RPC
    this.provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
    
    // Configure signer with PRIVATE_KEY_2
    this.signer = new ethers.Wallet(process.env.PRIVATE_KEY_2!, this.provider);

    // Default gas settings will be used in transaction options
    this.defaultGasSettings = {
      maxFeePerGas: ethers.parseUnits('120', 'gwei'),
      maxPriorityFeePerGas: ethers.parseUnits('96', 'gwei')
    };
  }

  public getHITContract(): HITContract {
    const contract = new ethers.Contract(
      '0x3b84221e63921E911b6Be16EeF4a7eee6709C1Bc', // SimpleHIT address
      SimpleHIT_ABI.abi,
      this.signer
    );
    return contract as HITContract;
  }

  public getPRVNContract(): ethers.Contract {
    return new ethers.Contract(
      process.env.PRVN_CONTRACT_ADDRESS!,
      PRVNToken_ABI.abi,
      this.signer
    );
  }

  // Helper method to get current gas settings
  public getGasSettings(): GasSettings {
    return this.defaultGasSettings;
  }
}

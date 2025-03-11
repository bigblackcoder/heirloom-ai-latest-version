const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  // Get private key from environment
  const privateKey = process.env.PRIVATE_KEY_PRIVATE_KEY;
  if (!privateKey) {
    console.error("PRIVATE_KEY_PRIVATE_KEY environment variable is not set");
    process.exit(1);
  }

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider("https://polygon-amoy.public.blastapi.io");
  const wallet = new ethers.Wallet(privateKey, provider);
  const address = await wallet.getAddress();

  // Get network configuration
  const network = await provider.getNetwork();
  console.log("\nNetwork:", {
    name: network.name,
    chainId: Number(network.chainId)
  });

  console.log("\nChecking wallet:", address);

  try {
    // Get balance
    const balance = await provider.getBalance(address);
    const balanceInPOL = ethers.formatEther(balance);
    console.log("POL Balance:", balanceInPOL, "POL");
    
    // Check if balance is sufficient for deployment
    if (parseFloat(balanceInPOL) < 0.1) {
      console.error("\nInsufficient POL balance. Minimum required: 0.1 POL");
      process.exit(1);
    }
    console.log("Sufficient POL balance for deployment confirmed ✓");

    // Verify we're on Amoy testnet
    if (Number(network.chainId) !== 80002) {
      console.error("Not connected to Polygon Amoy testnet (chainId: 80002)");
      process.exit(1);
    }
    console.log("Connected to Polygon Amoy testnet ✓");

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

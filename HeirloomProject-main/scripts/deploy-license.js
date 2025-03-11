const { ethers } = require("hardhat");
const { formatEther, parseUnits } = ethers;
const fs = require('fs');
const path = require('path');

async function main() {
    // Get the deployer's address
    const [deployer] = await ethers.getSigners();
    console.log("Deploying LicenseManager with account:", await deployer.getAddress());
    
    // Check balance
    const balance = await ethers.provider.getBalance(await deployer.getAddress());
    console.log("Account balance:", formatEther(balance), "POL");

    try {
        // Check network status
        const network = await ethers.provider.getNetwork();
        console.log("Connected to network:", {
            name: network.name,
            chainId: Number(network.chainId)
        });
        
        if (Number(network.chainId) !== 80002) {
            throw new Error("Not connected to Polygon Amoy testnet (chainId: 80002)");
        }
        
        // Get current gas price
        const feeData = await ethers.provider.getFeeData();
        console.log("Current gas price:", formatEther(feeData.gasPrice), "ETH");
        
        // Read PRVNToken address from deployment file
        const deploymentPath = path.join(__dirname, '../deployments/prvn-deployment.json');
        if (!fs.existsSync(deploymentPath)) {
            throw new Error("PRVNToken deployment info not found. Please deploy PRVNToken first.");
        }
        
        const prvnDeployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        const prvnAddress = prvnDeployment.PRVNToken;
        console.log("Using PRVNToken address:", prvnAddress);

        console.log("Starting LicenseManager deployment...");
        const LicenseManagerFactory = await ethers.getContractFactory("contracts/license-manager.sol:LicenseManager");
        console.log("Deploying LicenseManager...");
        const licenseManager = await LicenseManagerFactory.deploy(prvnAddress, {
            gasLimit: 3000000,
            maxFeePerGas: parseUnits("150", "gwei"),
            maxPriorityFeePerGas: parseUnits("120", "gwei")
        });

        console.log("Waiting for deployment transaction...");
        await licenseManager.waitForDeployment();
        const licenseAddress = await licenseManager.getAddress();
        console.log("LicenseManager deployed to:", licenseAddress);
        
        // Wait for additional confirmations
        console.log("Waiting for confirmations...");
        const deployTx = licenseManager.deploymentTransaction();
        await deployTx.wait(2);
        console.log("Deployment confirmed with 2 blocks");

        // Save deployment info
        const deploymentInfo = {
            ...prvnDeployment,
            LicenseManager: licenseAddress,
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync(
            path.join(path.dirname(deploymentPath), `full-deployment.json`),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\nDeployment info saved to full-deployment.json");
        
    } catch (error) {
        console.error("\nDeployment failed!");
        console.error("Error details:", error);
        process.exitCode = 1;
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

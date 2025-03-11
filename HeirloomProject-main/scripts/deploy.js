const { ethers } = require("hardhat");
const { formatEther, parseUnits } = ethers;
const fs = require('fs');
const path = require('path');

async function main() {
    // Get the deployer's address
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", formatEther(balance), "POL");

    try {
        console.log("Starting deployment...");
        
        // 1. Deploy PRVNToken
        console.log("\nDeploying PRVNToken...");
        const PRVNFactory = await ethers.getContractFactory("PRVNToken");
        const prvnToken = await PRVNFactory.deploy({
            gasLimit: 3000000,
            gasPrice: parseUnits("25", "gwei")
        });
        console.log("Waiting for PRVNToken deployment...");
        await prvnToken.waitForDeployment();
        console.log("PRVNToken deployed to:", await prvnToken.getAddress());
        
        // 2. Deploy LicenseManager with PRVNToken address
        console.log("\nDeploying LicenseManager...");
        const LicenseManagerFactory = await ethers.getContractFactory("LicenseManager");
        const licenseManager = await LicenseManagerFactory.deploy(await prvnToken.getAddress(), {
            gasLimit: 3000000,
            gasPrice: parseUnits("25", "gwei")
        });
        console.log("Waiting for LicenseManager deployment...");
        await licenseManager.waitForDeployment();
        console.log("LicenseManager deployed to:", await licenseManager.getAddress());
        
        // Post-deployment role assignments
        console.log("\nPerforming post-deployment setup...");
        
        // Grant ADMIN_ROLE to deployer in PRVNToken
        const ADMIN_ROLE = await prvnToken.ADMIN_ROLE();
        console.log("Granting ADMIN_ROLE to deployer in PRVNToken...");
        const grantAdminTx = await prvnToken.grantRole(ADMIN_ROLE, deployer.address, {
            gasLimit: 100000,
            gasPrice: parseUnits("25", "gwei")
        });
        console.log("Waiting for role assignment confirmation...");
        await grantAdminTx.wait(2); // Wait for 2 confirmations
        console.log("ADMIN_ROLE granted to deployer in PRVNToken");
        
        // Summary
        console.log("\nDeployment Summary:");
        console.log("-------------------");
        console.log("PRVNToken:", prvnToken.address);
        console.log("LicenseManager:", licenseManager.address);
        console.log("Deployer (Admin):", deployer.address);
        
        // Save deployment addresses to a file
        const deploymentInfo = {
            PRVNToken: await prvnToken.getAddress(),
            LicenseManager: await licenseManager.getAddress(),
            deployer: deployer.address,
            network: network.name,
            timestamp: new Date().toISOString()
        };
        
        const deploymentPath = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentPath)) {
            fs.mkdirSync(deploymentPath);
        }
        
        fs.writeFileSync(
            path.join(deploymentPath, `deployment-${network.name}.json`),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
    } catch (error) {
        console.error("\nDeployment failed!");
        console.error("Error details:", error);
        process.exitCode = 1;
        throw error;
    }
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

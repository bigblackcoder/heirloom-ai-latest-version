const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // Load deployment info
        const deploymentPath = path.join(__dirname, '../deployments/full-deployment.json');
        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        
        console.log("\nVerifying deployment configuration...");
        console.log("----------------------------------------");
        
        // Get contract instances
        const PRVNToken = await ethers.getContractFactory("contracts/prvn-smartcontract.sol:PRVNToken");
        const LicenseManager = await ethers.getContractFactory("contracts/license-manager.sol:LicenseManager");
        
        const prvnToken = await PRVNToken.attach(deploymentInfo.PRVNToken);
        const licenseManager = await LicenseManager.attach(deploymentInfo.LicenseManager);
        
        // Verify PRVNToken owner has ADMIN_ROLE
        const ADMIN_ROLE = await prvnToken.ADMIN_ROLE();
        const hasAdminRole = await prvnToken.hasRole(ADMIN_ROLE, deploymentInfo.deployer);
        console.log("\n1. Verifying PRVNToken admin role:");
        console.log(`   Deployer address: ${deploymentInfo.deployer}`);
        console.log(`   Has ADMIN_ROLE: ${hasAdminRole ? '✓' : '✗'}`);
        
        if (!hasAdminRole) {
            throw new Error("Deployer does not have ADMIN_ROLE");
        }
        
        // Verify LicenseManager is linked to PRVNToken
        const linkedPRVNToken = await licenseManager.prvnTokenContract();
        console.log("\n2. Verifying LicenseManager configuration:");
        console.log(`   Expected PRVNToken: ${deploymentInfo.PRVNToken}`);
        console.log(`   Linked PRVNToken:  ${linkedPRVNToken}`);
        console.log(`   Correctly linked: ${linkedPRVNToken === deploymentInfo.PRVNToken ? '✓' : '✗'}`);
        
        if (linkedPRVNToken !== deploymentInfo.PRVNToken) {
            throw new Error("LicenseManager not properly linked to PRVNToken");
        }
        
        console.log("\nDeployment verification completed successfully! ✓");
        console.log("All checks passed.");
        
    } catch (error) {
        console.error("\nVerification failed!");
        console.error("Error:", error.message);
        process.exitCode = 1;
        throw error;
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

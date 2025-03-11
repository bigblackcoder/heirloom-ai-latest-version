const { ethers, network } = require("hardhat");
const { formatEther, parseUnits, formatUnits } = ethers;
const fs = require('fs');
const path = require('path');

const deploymentPath = path.join(__dirname, '../deployments');
const fullDeploymentPath = path.join(deploymentPath, 'full-deployment.json');

async function checkNetworkHealth(provider) {
    console.log("\nChecking network health...");
    
    try {
        // Check network connection
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== 80002) {
            throw new Error("Not connected to Polygon Amoy testnet (chainId: 80002)");
        }
        console.log("Network connection verified ✓");
        
        // Check gas prices
        const feeData = await provider.getFeeData();
        const currentMaxFeePerGas = Number(formatUnits(feeData.maxFeePerGas || feeData.gasPrice, "gwei"));
        const currentMaxPriorityFeePerGas = Number(formatUnits(feeData.maxPriorityFeePerGas || 0n, "gwei"));
        
        console.log("Current network gas prices:", {
            baseFeePerGas: feeData.gasPrice ? `${formatUnits(feeData.gasPrice, "gwei")} gwei` : "unknown",
            maxFeePerGas: `${currentMaxFeePerGas} gwei`,
            maxPriorityFeePerGas: `${currentMaxPriorityFeePerGas} gwei`
        });
        
        // Check if gas prices are reasonable
        if (currentMaxFeePerGas > 500) {
            throw new Error(`Network gas prices are unusually high: ${currentMaxFeePerGas} gwei`);
        }
        console.log("Gas prices verified ✓");
        
        return true;
    } catch (error) {
        console.error("Network health check failed:", error.message);
        return false;
    }
}

async function main() {
    // Get the deployer's address
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", formatEther(balance), "POL");

    try {
        // Verify network health
        const isHealthy = await checkNetworkHealth(ethers.provider);
        if (!isHealthy) {
            throw new Error("Network health check failed");
        }
        console.log("\nNetwork health verified, proceeding with deployment...");

        // Deploy ConcreteMetadataManagement
        console.log("\nDeploying ConcreteMetadataManagement...");
        const ConcreteMetadataManagement = await ethers.getContractFactory("ConcreteMetadataManagement");
        const metadataManagement = await ConcreteMetadataManagement.deploy({
            gasLimit: 5000000,
            maxFeePerGas: ethers.parseUnits("120", "gwei"),
            maxPriorityFeePerGas: ethers.parseUnits("96", "gwei")
        });
        
        console.log("Deployment transaction hash:", metadataManagement.deploymentTransaction().hash);
        console.log("Waiting for deployment confirmation...");
        
        // Wait for deployment with timeout
        const deploymentTimeout = 180000; // 3 minutes
        const deploymentStart = Date.now();
        let metadataManagementAddress;
        
        while (Date.now() - deploymentStart < deploymentTimeout) {
            try {
                await metadataManagement.waitForDeployment();
                metadataManagementAddress = await metadataManagement.getAddress();
                console.log("MetadataManagement deployed successfully to:", metadataManagementAddress);
                
                // Verify contract deployment
                const code = await ethers.provider.getCode(metadataManagementAddress);
                if (code === "0x") throw new Error("Contract not deployed");
                
                console.log("Contract deployment verified ✓");
                break;
            } catch (error) {
                if (Date.now() - deploymentStart >= deploymentTimeout) {
                    throw new Error("Deployment timeout exceeded");
                }
                console.log("Waiting for deployment confirmation...");
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        if (!metadataManagementAddress) {
            throw new Error("Deployment failed: timeout exceeded");
        }
        
        // Save deployment info
        const deploymentInfo = {
            MetadataManagement: metadataManagementAddress,
            deployer: deployer.address,
            network: network.name,
            timestamp: new Date().toISOString(),
            rpcEndpoint: "https://rpc-amoy.polygon.technology",
            gasSettings: {
                gasLimit: "5000000",
                maxFeePerGas: "120 gwei",
                maxPriorityFeePerGas: "96 gwei"
            },
            transaction: metadataManagement.deploymentTransaction().hash,
            deploymentDuration: `${((Date.now() - deploymentStart) / 1000).toFixed(2)} seconds`
        };
        
        if (!fs.existsSync(deploymentPath)) {
            fs.mkdirSync(deploymentPath);
        }
        
        // Save deployment info
        fs.writeFileSync(
            path.join(deploymentPath, `metadata-management-deployment-${network.name}.json`),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\nDeployment info saved to:", path.join(deploymentPath, `metadata-management-deployment-${network.name}.json`));
        
        console.log("\nDeployment Summary:");
        console.log("-------------------");
        console.log("MetadataManagement:", metadataManagementAddress);
        console.log("Deployer:", deployer.address);
        console.log("Network:", network.name);
        
    } catch (error) {
        console.error("\nDeployment failed!");
        console.error("Error details:", error);
        process.exitCode = 1;
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { main };

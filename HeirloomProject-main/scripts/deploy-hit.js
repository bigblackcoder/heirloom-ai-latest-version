const { ethers, network } = require("hardhat");
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
        
        // Deploy SimpleHIT with proven working configuration
        console.log("\nDeploying SimpleHIT...");
        const SimpleHIT = await ethers.getContractFactory("SimpleHIT");
        const simpleHIT = await SimpleHIT.deploy({
            gasLimit: 5000000,
            maxFeePerGas: ethers.parseUnits("120", "gwei"),
            maxPriorityFeePerGas: ethers.parseUnits("96", "gwei")
        });
        
        console.log("Deployment transaction hash:", simpleHIT.deploymentTransaction().hash);
        console.log("Waiting for deployment confirmation...");
        
        // Wait for deployment with timeout
        const deploymentTimeout = 180000; // 3 minutes
        const deploymentStart = Date.now();
        let hitAddress;
        
        while (Date.now() - deploymentStart < deploymentTimeout) {
            try {
                await simpleHIT.waitForDeployment();
                hitAddress = await simpleHIT.getAddress();
                console.log("SimpleHIT deployed successfully to:", hitAddress);
                
                // Verify contract deployment
                const code = await ethers.provider.getCode(hitAddress);
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
        
        if (!hitAddress) {
            throw new Error("Deployment failed: timeout exceeded");
        }
        
        // Save deployment info with actual gas price used
        const deploymentInfo = {
            SimpleHIT: hitAddress,
            deployer: deployer.address,
            network: network.name,
            timestamp: new Date().toISOString(),
            rpcEndpoint: "https://rpc-amoy.polygon.technology",
            gasSettings: {
                gasLimit: "5000000",
                maxFeePerGas: "120 gwei",
                maxPriorityFeePerGas: "96 gwei",
                baseSettings: {
                    minMaxFeePerGas: "100 gwei",
                    minMaxPriorityFeePerGas: "80 gwei",
                    baseGasLimit: "5000000"
                },
                progressiveSettings: {
                    feeMultiplier: "110%",
                    gasLimitIncrease: "0"
                }
            },
            transactionHash: simpleHIT.deploymentTransaction().hash,
            deploymentDuration: `${((Date.now() - deploymentStart) / 1000).toFixed(2)} seconds`
        };
        
        const deploymentPath = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentPath)) {
            fs.mkdirSync(deploymentPath);
        }
        
        const deploymentFile = path.join(deploymentPath, `hit-deployment-${network.name}.json`);
        fs.writeFileSync(
            deploymentFile,
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\nDeployment info saved to:", deploymentFile);
        
        console.log("\nDeployment Summary:");
        console.log("-------------------");
        console.log("SimpleHIT:", hitAddress);
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

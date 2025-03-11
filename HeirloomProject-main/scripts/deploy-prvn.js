const { ethers } = require("hardhat");
const { formatEther, parseUnits, formatUnits } = ethers;
const fs = require('fs');
const path = require('path');

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
        if (currentMaxFeePerGas > 500) { // Sanity check for extremely high gas prices
            throw new Error(`Network gas prices are unusually high: ${currentMaxFeePerGas} gwei`);
        }
        console.log("Gas prices verified ✓");
        
        // Check recent block production
        const latestBlock = await provider.getBlock("latest");
        const prevBlock = await provider.getBlock(latestBlock.number - 1);
        if (!prevBlock) {
            throw new Error("Unable to fetch previous block");
        }
        
        const blockTimeSeconds = latestBlock.timestamp - prevBlock.timestamp;
        if (blockTimeSeconds > 60) { // Block time should be reasonable
            throw new Error(`Network might be congested. Last block took ${blockTimeSeconds}s`);
        }
        console.log("Block production verified ✓");
        
        return true;
    } catch (error) {
        console.error("Network health check failed:", error.message);
        return false;
    }
}

async function deployWithRetry(maxAttempts = 3) {
    // Use environment variables for RPC URLs or fall back to public endpoint
    const rpcUrls = [
        "https://rpc-amoy.polygon.technology",
        "https://polygon-amoy.public.blastapi.io"
    ];
    
    let deploymentError = null;
    
    for (const rpcUrl of rpcUrls) {
        console.log(`\nTrying RPC endpoint: ${rpcUrl}`);
        
        try {
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_PRIVATE_KEY, provider);
            
            console.log("Deploying PRVNToken with account:", await wallet.getAddress());
            const balance = await provider.getBalance(await wallet.getAddress());
            console.log("Account balance:", formatEther(balance), "POL");

            // Verify network health before deployment
            const isHealthy = await checkNetworkHealth(provider);
            if (!isHealthy) {
                throw new Error("Network health check failed");
            }
            console.log("\nNetwork health verified, proceeding with deployment...");
            
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    console.log(`\nDeployment attempt ${attempt}/${maxAttempts}`);
                    
                    console.log("Starting PRVNToken deployment...");
                    const PRVNFactory = await ethers.getContractFactory("PRVNToken", wallet);
                    console.log("Deploying PRVNToken...");
                    
                    // Calculate progressive gas settings while maintaining minimums
                    const baseGasLimit = 5000000;
                    const minMaxFeePerGas = parseUnits("150", "gwei");
                    const minMaxPriorityFeePerGas = parseUnits("120", "gwei");
                    
                    // More aggressive gas price escalation (20% increase per attempt)
                    const gasLimitIncrease = (attempt - 1) * 500000; // 500k increment per attempt
                    const feeMultiplier = BigInt(100 + (attempt * 20)); // 20% increase per attempt
                    
                    const gasLimit = baseGasLimit + gasLimitIncrease;
                    const maxFeePerGas = (minMaxFeePerGas * feeMultiplier) / 100n;
                    const maxPriorityFeePerGas = (minMaxPriorityFeePerGas * feeMultiplier) / 100n;
                    
                    // Additional gas price monitoring
                    try {
                        const feeData = await provider.getFeeData();
                        console.log("Current network gas prices:", {
                            baseFeePerGas: feeData.gasPrice ? `${formatUnits(feeData.gasPrice, "gwei")} gwei` : "unknown",
                            maxFeePerGas: feeData.maxFeePerGas ? `${formatUnits(feeData.maxFeePerGas, "gwei")} gwei` : "unknown",
                            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? `${formatUnits(feeData.maxPriorityFeePerGas, "gwei")} gwei` : "unknown"
                        });
                    } catch (error) {
                        console.log("Unable to fetch current gas prices:", error.message);
                    }
                    
                    // Use explicit EIP-1559 transaction
                    const deploymentTransaction = await PRVNFactory.getDeployTransaction();
                    deploymentTransaction.type = 2; // EIP-1559
                    deploymentTransaction.gasLimit = BigInt(gasLimit);
                    deploymentTransaction.maxFeePerGas = maxFeePerGas;
                    deploymentTransaction.maxPriorityFeePerGas = maxPriorityFeePerGas;
                    
                    const gweiMaxFeePerGas = Number(formatUnits(deploymentTransaction.maxFeePerGas, "gwei"));
                    const gweiMaxPriorityFeePerGas = Number(formatUnits(deploymentTransaction.maxPriorityFeePerGas, "gwei"));
                    
                    console.log("Deployment transaction configured:", {
                        type: deploymentTransaction.type,
                        gasLimit: deploymentTransaction.gasLimit.toString(),
                        maxFeePerGas: `${gweiMaxFeePerGas} gwei`,
                        maxPriorityFeePerGas: `${gweiMaxPriorityFeePerGas} gwei`
                    });
                    
                    const initialDeployTx = await wallet.sendTransaction(deploymentTransaction);
                    console.log("Deployment transaction sent:", initialDeployTx.hash);
                    
                    console.log("Waiting for deployment transaction...");
                    let receipt;
                    const startTime = Date.now();
                    const maxWaitTime = 15 * 60 * 1000; // 15 minutes
                    
                    while (!receipt && Date.now() - startTime < maxWaitTime) {
                        try {
                            console.log(`Checking transaction status... (${Math.floor((Date.now() - startTime) / 1000)}s elapsed)`);
                            receipt = await provider.getTransactionReceipt(initialDeployTx.hash);
                            if (!receipt) {
                                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s between checks
                            }
                        } catch (error) {
                            console.log("Error checking transaction:", error.message);
                            await new Promise(resolve => setTimeout(resolve, 10000));
                        }
                    }
                    
                    if (!receipt) {
                        throw new Error("Deployment timed out after 15 minutes");
                    }
                    
                    console.log("Initial deployment confirmed");
                    
                    const prvnToken = await ethers.getContractAt("PRVNToken", receipt.contractAddress, wallet);
                    const prvnAddress = receipt.contractAddress;
                    console.log("PRVNToken deployed to:", prvnAddress);
                    
                    // Wait for additional confirmations
                    console.log("Waiting for additional confirmations...");
                    await provider.waitForTransaction(initialDeployTx.hash, 2);
                    console.log("Deployment confirmed with 2 blocks");

                    // Save deployment info
                    const deploymentPath = path.join(__dirname, '../deployments');
                    if (!fs.existsSync(deploymentPath)) {
                        fs.mkdirSync(deploymentPath);
                    }
                    
                    const deploymentInfo = {
                        PRVNToken: prvnAddress,
                        deployer: await wallet.getAddress(),
                        network: network.name,
                        timestamp: new Date().toISOString(),
                        rpcEndpoint: rpcUrl,
                        deploymentAttempt: attempt,
                        gasSettings: {
                            gasLimit: gasLimit.toString(),
                            maxFeePerGas: `${Number(formatUnits(maxFeePerGas, "gwei"))} gwei`,
                            maxPriorityFeePerGas: `${Number(formatUnits(maxPriorityFeePerGas, "gwei"))} gwei`,
                            baseSettings: {
                                minMaxFeePerGas: "100 gwei",
                                minMaxPriorityFeePerGas: "80 gwei",
                                baseGasLimit: baseGasLimit.toString()
                            },
                            progressiveSettings: {
                                feeMultiplier: `${100 + (attempt * 10)}%`,
                                gasLimitIncrease: gasLimitIncrease.toString()
                            }
                        }
                    };
                    
                    fs.writeFileSync(
                        path.join(deploymentPath, `prvn-deployment.json`),
                        JSON.stringify(deploymentInfo, null, 2)
                    );
                    
                    console.log("\nDeployment info saved to prvn-deployment.json");
                    return; // Success - exit both loops
                    
                } catch (error) {
                    console.error(`\nDeployment attempt ${attempt} failed!`);
                    console.error("Error details:", error);
                    deploymentError = error;
                    
                    if (attempt < maxAttempts) {
                        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
                        console.log(`Waiting ${waitTime/1000} seconds before next attempt...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                }
            }
        } catch (error) {
            console.error(`\nRPC endpoint ${rpcUrl} failed:`, error);
            deploymentError = error;
            // Continue to next RPC endpoint
        }
    }

    // If we get here, all RPC endpoints and attempts failed
    console.error("\nAll deployment attempts failed!");
    throw deploymentError;
}

async function main() {
    try {
        await deployWithRetry(3);
        console.log("\nDeployment completed successfully!");
    } catch (error) {
        console.error("\nDeployment failed after all retry attempts!");
        console.error("Final error:", error);
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

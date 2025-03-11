require("@nomicfoundation/hardhat-toolbox");
const { task } = require("hardhat/config");

task("check-tx", "Check transaction status")
  .addPositionalParam("txhash", "Transaction hash to check")
  .setAction(async (taskArgs, hre) => {
    try {
        const txHash = taskArgs.txhash;
        console.log(`\nChecking transaction on Amoy testnet...`);
        console.log(`Transaction hash: ${txHash}`);
        
        const provider = hre.ethers.provider;
        
        // Get current block
        const currentBlock = await provider.getBlockNumber();
        console.log(`\nCurrent block: ${currentBlock}`);
        
        // Get transaction
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
            console.log("\nTransaction not found. It might be pending or invalid.");
            return;
        }

        console.log("\nTransaction Details:");
        console.log("-------------------");
        console.log("From:", tx.from);
        console.log("To:", tx.to || "Contract Creation");
        console.log("Value:", hre.ethers.formatEther(tx.value), "POL");
        console.log("Gas Price:", hre.ethers.formatUnits(tx.gasPrice || 0, "gwei"), "gwei");
        console.log("Gas Limit:", tx.gasLimit.toString());
        console.log("Nonce:", tx.nonce);

        // Get transaction receipt
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
            console.log("\nTransaction Status: PENDING");
            console.log("Waiting for confirmation...");
            return;
        }

        console.log("\nTransaction Receipt:");
        console.log("-------------------");
        console.log("Status:", receipt.status === 1 ? "Success ✓" : "Failed ✗");
        console.log("Block Number:", receipt.blockNumber);
        console.log("Block Confirmations:", currentBlock - receipt.blockNumber);
        console.log("Gas Used:", receipt.gasUsed.toString());
        console.log("Effective Gas Price:", hre.ethers.formatUnits(receipt.effectiveGasPrice || 0, "gwei"), "gwei");
        
        if (receipt.status === 1 && !tx.to) {
            console.log("\nContract Deployment:");
            console.log("-------------------");
            console.log("Contract Address:", receipt.contractAddress);
            
            // Verify contract has code
            const code = await provider.getCode(receipt.contractAddress);
            console.log("Contract verified:", code !== "0x" ? "✓" : "✗");
        }

    } catch (error) {
        console.error("\nError checking transaction:", error.message);
    }
  });

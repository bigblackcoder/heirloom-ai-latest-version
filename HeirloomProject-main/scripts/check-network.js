const { ethers } = require("hardhat");

async function main() {
    try {
        const [signer] = await ethers.getSigners();
        console.log("Connected account:", signer.address);
        
        const provider = await ethers.provider;
        const network = await provider.getNetwork();
        console.log("Network:", {
            name: network.name,
            chainId: network.chainId
        });
        
        const blockNumber = await provider.getBlockNumber();
        console.log("Current block:", blockNumber);
        
        const balance = await provider.getBalance(signer.address);
        console.log("Account balance:", ethers.formatEther(balance), "POL");
        
    } catch (error) {
        console.error("Network error:", error);
        process.exit(1);
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

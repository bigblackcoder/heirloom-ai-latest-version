const { ethers } = require("hardhat");

async function main() {
    console.log("Verifying all contract deployments on Polygon Amoy testnet...\n");
    
    const contracts = {
        "PRVNToken": "0x1fC9F0fF7A6D3e9C0C64d187B01a43BbFF7939d8",
        "LicenseManager": "0x433674053Fc3696b1707313e2dF95CcA81B9DE7b",
        "AccessManagement": "0xe74f7E647A65923db32A1D76B0BCc078340B966A",
        "HITLinking": "0x0380587A1C83Db122F02c5FB10e2e069f8e85Ef2",
        "SimpleHIT": "0x6AFF771a6245945c19D13032Ec954aFA18DcA1b2",
        "GovernanceModule": "0x20086dA7De70Bd6476230c0C573a1497789Aae2E",
        "ConcreteMetadataManagement": "0x2abf1b5524548128257d20BeB4373ce7D34dF419"
    };

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("Network:", {
        name: network.name,
        chainId: Number(network.chainId)
    });

    // Verify chainId is Polygon Amoy (80002)
    if (Number(network.chainId) !== 80002) {
        throw new Error("Not connected to Polygon Amoy testnet (chainId: 80002)");
    }
    console.log("Connected to Polygon Amoy testnet ✓\n");

    // Check each contract
    for (const [name, address] of Object.entries(contracts)) {
        try {
            console.log(`Verifying ${name} at ${address}...`);
            const code = await ethers.provider.getCode(address);
            
            if (code === "0x") {
                console.log(`❌ ${name}: No contract code found at ${address}\n`);
                continue;
            }
            
            console.log(`✓ ${name}: Contract verified at ${address}\n`);
        } catch (error) {
            console.error(`Error verifying ${name}:`, error.message, "\n");
        }
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

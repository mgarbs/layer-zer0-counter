const { ethers } = require("hardhat");
require("dotenv").config();

const { H_ENDPOINT, BSC_ENDPOINT, DEPLOOOOYER_EOA } = process.env;

async function main() {
    // Hardhat always runs the compile task when running scripts through it.
    // If you compile your contracts before running this script,
    // the compilation step will be skipped to save time.
    
    // Replace 'CounterOApp' with the name of your contract.
    const CounterOApp = await ethers.getContractFactory("CounterOApp");

    // Replace 'ENDPOINT_ADDRESS' with the actual LayerZero Endpoint address for the network.
    // This address varies between networks, so ensure you have the correct one for Hedera or BSC testnet.
    const endpointAddress = BSC_ENDPOINT;


    // Deploying the contract
    const counterOApp = await CounterOApp.deploy(endpointAddress, DEPLOOOOYER_EOA);

    await counterOApp.deployed();

    console.log("CounterOApp deployed to:", counterOApp.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

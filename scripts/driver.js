require('dotenv').config();
const { ethers } = require("ethers");
const { Options } = require('@layerzerolabs/lz-v2-utilities');

function tinybarToHbar(tinybarAmount) {
    return ethers.utils.formatUnits(tinybarAmount, 8);
}

function hbarToTinybar(hbarAmount) {
    return ethers.utils.parseUnits(hbarAmount, 8);
}

let options = Options.newOptions();
const GAS_LIMIT = 2000000; // Increased gas limit
const MSG_VALUE = hbarToTinybar("0");
options = options.addExecutorLzReceiveOption(GAS_LIMIT, MSG_VALUE);
const optionsHex = options.toHex();

console.log("Options Hex:", optionsHex);

const contractABI = require("../artifacts/contracts/CounterOApp.sol/CounterOApp.json").abi;

const hederaProvider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api");
const hederaContractAddress = "0x7b67F6d6dDFC690Dc37bd1E4F2aa4cbDC2242D59";
const hederaContract = new ethers.Contract(hederaContractAddress, contractABI, hederaProvider);

const bscTestnetProvider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
const bscTestnetContractAddress = "0x6fe7E4909909aC2164BF8f2503286769cD3c5E9c";
const bscTestnetContract = new ethers.Contract(bscTestnetContractAddress, contractABI, bscTestnetProvider);

const dstEid = 40102;

async function checkContractState(contract) {
    const owner = await contract.owner();
    console.log("Contract owner:", owner);

    const counter = await contract.getCounter();
    console.log("Current counter value:", counter.toString());

    const endpoint = await contract.getEndpoint();
    console.log("LayerZero endpoint:", endpoint);

    const peer = await contract.peers(dstEid);
    console.log(`Peer for BSC testnet (EID ${dstEid}):`, peer);
}

async function incrementCounter() {
    console.log("Starting the counter increment process...");

    try {
        const counterBefore = await bscTestnetContract.getCounter();
        console.log(`Counter on BSC Testnet (destination) before increment: ${counterBefore.toString()}`);

        const privateKey = process.env.PRIVATE_KEY;
        const signer = new ethers.Wallet(privateKey, hederaProvider);
        const contractWithSigner = hederaContract.connect(signer);

        console.log("Checking contract state...");
        await checkContractState(contractWithSigner);

        console.log("Getting the quote for the cross-chain message...");
        const { nativeFee, lzTokenFee } = await contractWithSigner.quote(dstEid, optionsHex, false);
        console.log(`Quote - Native Fee: ${tinybarToHbar(nativeFee)} HBAR, LZ Token Fee: ${lzTokenFee.toString()}`);

        console.log("Estimating gas...");
        const estimatedGas = await contractWithSigner.estimateGas.sendIncrement(dstEid, optionsHex, { value: nativeFee });
        console.log(`Estimated gas: ${estimatedGas.toString()}`);

        console.log("Sending increment transaction...");
        console.log(`Sending with value: ${tinybarToHbar(nativeFee)} HBAR`);
        const tx = await contractWithSigner.sendIncrement(dstEid, optionsHex, {
            value: nativeFee.mul(10000000000),
            gasLimit: estimatedGas.mul(120).div(100) // Add 20% buffer to estimated gas
        });
        console.log(`Transaction hash: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log("Increment transaction confirmed. Receipt:", receipt);

        for (const log of receipt.logs) {
            try {
                const parsedLog = contractWithSigner.interface.parseLog(log);
                if (parsedLog.name === "LogSendIncrement") {
                    console.log("LogSendIncrement event:", {
                        dstEid: parsedLog.args.dstEid,
                        msgValue: tinybarToHbar(parsedLog.args.msgValue),
                        nativeFee: tinybarToHbar(parsedLog.args.nativeFee)
                    });
                }
            } catch (error) {
                // Ignore errors from logs that don't match our events
            }
        }

        console.log("Waiting for the cross-chain message to process...");
        await new Promise(resolve => setTimeout(resolve, 120000));

        const counterAfter = await bscTestnetContract.getCounter();
        console.log(`Counter on BSC Testnet (destination) after increment: ${counterAfter.toString()}`);
    } catch (error) {
        console.error("An error occurred:");
        console.error(error);
        if (error.error && error.error.message) {
            console.error("Error message:", error.error.message);
        }
    }
}

incrementCounter().catch(console.error);
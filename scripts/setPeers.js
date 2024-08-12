const { ethers } = require("hardhat");

// Replace these with your contract addresses on each chain
const contractAddressHedera = "0x740EC0797a35a33E3A68239deadc301957A31E1f"; // replace with deployed contract hedera
const contractAddressBSCTestnet = "0x246B81956BDC91b4d2100264e1e4206cf8016988"; // replace with deployed contract bsc

// Convert to bytes32
const addressToBytes32 = (address) => ethers.utils.hexZeroPad(address, 32);

async function main() {
  // Assuming you're running this against the Hedera contract to set its peer to BSC Testnet
  // const contractHedera = await ethers.getContractAt("CounterOApp", contractAddressHedera);
  // await contractHedera.setPeer(
  //   40102, // EID for BSC Testnet
  //   addressToBytes32(contractAddressBSCTestnet)
  // );

  // console.log(`Peer set for Hedera Contract: ${contractAddressBSCTestnet} as bytes32`);

  // If you also need to set the peer for the BSC testnet contract, you would similarly get a contract instance for it and call setPeer, but with Hedera's details
  const contractBSCTestnet = await ethers.getContractAt("CounterOApp", contractAddressBSCTestnet);
  await contractBSCTestnet.setPeer(
    40285, // EID for Hedera
    addressToBytes32(contractAddressHedera)
  );
  
  console.log(`Peer set for BSC testnet Contract: ${contractAddressHedera} as bytes32`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

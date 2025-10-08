import hre from "hardhat";

async function main() {
  const CarbonCredit = await hre.ethers.getContractFactory("CarbonCreditsMarketplace");
  const carbon = await CarbonCredit.deploy('0xBd4B1820fFdd2F53dB8fD4157D3DA36DdDF84473');
  await carbon.waitForDeployment();
  console.log("CarbonCredit.sol deployed to:", carbon.target);  }

main().catch((error) => {
  console.error(error); 
  process.exitCode = 1;
}); 
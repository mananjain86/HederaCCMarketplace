import hre from "hardhat";

async function main() {
  // 1️⃣ Deploy the handle company contract
  const CompanyContract = await hre.ethers.getContractFactory("HandleCompany");
  const company = await CompanyContract.deploy();
  await company.waitForDeployment();
  console.log("HandleCompany.sol deployed to:", company.target);

  // 2️⃣ Deploy the carbon credit marketplace contract
  const CarbonCredit = await hre.ethers.getContractFactory("CarbonCreditsMarketplace");
  const carbon = await CarbonCredit.deploy(company.target);
  await carbon.waitForDeployment();
  console.log("CarbonCreditMarketPlace.sol deployed to:", carbon.target);  

  // 3️⃣ Deploy the forest token marketplace contract 
  const ForestContract = await hre.ethers.getContractFactory("DynamicForestFractionalMarketplaceDAO_Final");
  const govRegistrarAddress = "0x7e84c0b414f9256bcea6ed2bc9c750743d3dd88e"; // your address who you want to act as government
  const forest = await ForestContract.deploy(company.target, govRegistrarAddress);
  await forest.waitForDeployment();
  console.log("ForestTokenMarketplace.sol deployed to:", forest.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
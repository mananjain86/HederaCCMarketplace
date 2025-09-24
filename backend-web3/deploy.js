import hre from "hardhat";

async function main() {
  const CompanyRegister = await hre.ethers.getContractFactory("HandleCompany");
  const register = await CompanyRegister.deploy();
  await register.waitForDeployment();
  console.log("company.sol deployed to:", register.target);
  }

main().catch((error) => {
  console.error(error); 
  process.exitCode = 1;
}); 
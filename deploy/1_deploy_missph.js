module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const RFOX = process.env.RFOX;
  const tokenURI = process.env.ERC_URI;
  const tokenName = "MissUniversePh";
  const tokenSymbol = "MISSUPH";

  if (!RFOX || !tokenURI) {
    throw new Error("RFOX or URI not defined!");
  }
  // Deploy contract
  await deploy("MissPH", {
    from: deployer,
    log: true,
    owner: deployer,
    args: [tokenName, tokenSymbol, tokenURI, RFOX],
  });
};

module.exports.tags = ["MissPH"];

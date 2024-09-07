const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const DeployModule = buildModule("UploadModule", (m) => {
  const uploadContract = m.contract("Upload");
  return uploadContract;
});

module.exports = DeployModule;
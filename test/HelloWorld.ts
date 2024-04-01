import { expect } from "chai";
import { viem } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("HelloWorld", function () {
  async function deployContractFixture() {
    const publicClient = await viem.getPublicClient();
    const [owner, otherAccount] = await viem.getWalletClients();
    const helloWorldContract = await viem.deployContract("HelloWorld");
    return {
      publicClient,
      owner,
      otherAccount,
      helloWorldContract,
    };
  }
  it("Should give a Hello World", async () => {
    const { helloWorldContract } = await loadFixture(deployContractFixture);
    const helloWorldText = await helloWorldContract.read.helloWorld();
    expect(helloWorldText).to.eq("Hello World");
  });

  it("Should change text correctly", async function () {
    const helloWorldContract = await viem.deployContract("HelloWorld");
    const helloWorldText = await helloWorldContract.read.helloWorld();
    const tx = await helloWorldContract.write.setText(["Potato!"]);
    const publicClient = await viem.getPublicClient();
    const receipt = await publicClient.getTransactionReceipt({ hash: tx });
    const helloWorldText2 = await helloWorldContract.read.helloWorld();
    expect(helloWorldText2).to.eq("Potato!");
  });
  it("Should not allow anyone other than owner to call transfer Ownership", async function () {
    const { helloWorldContract, otherAccount } = await loadFixture(
      deployContractFixture
    );
    const helloWorldContractAsOtherAccount = await viem.getContractAt(
      "HelloWorld",
      helloWorldContract.address,
      { walletClient: otherAccount }
    );
    await expect(
      helloWorldContractAsOtherAccount.write.transferOwnership([
        otherAccount.account.address,
      ])
    ).to.be.rejectedWith("Caller is not the owner");
  });
  it("Should execute transfer ownership correctly", async function () {
    const { owner, publicClient, helloWorldContract, otherAccount } =
      await loadFixture(deployContractFixture);
    const tx = await helloWorldContract.write.transferOwnership([
      otherAccount.account.address,
    ]);
    const receipt = await publicClient.getTransactionReceipt({ hash: tx });
    expect(receipt.status).to.be.equal("success");
    const contractOwner = await helloWorldContract.read.owner();
    expect(contractOwner.toLowerCase()).to.equal(otherAccount.account.address);
    const helloWorldContractAsPreviousAccount = await viem.getContractAt(
      "HelloWorld",
      helloWorldContract.address,
      { walletClient: owner }
    );
    await expect(
      helloWorldContractAsPreviousAccount.write.transferOwnership([
        owner.account.address,
      ])
    ).to.be.rejectedWith("Caller is not the owner");
  });
});

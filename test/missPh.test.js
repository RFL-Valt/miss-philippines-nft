const { expect } = require("chai");

describe("Miss PH", function () {
  let missPh, owner, bob, jane, sara;
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const id1 = 123;
  const id2 = 124;

  const RFOX = process.env.RFOX;
  const tokenURI = process.env.ERC_URI;
  
  const tokenName = "MissUniversePh";
  const tokenSymbol = "MISSUPH";

  beforeEach(async () => {
    const nftContract = await ethers.getContractFactory("MissPH");
    missPh = await nftContract.deploy(tokenName, tokenSymbol, tokenURI, RFOX);
    [owner, bob, jane, sara] = await ethers.getSigners();
    await missPh.deployed();
  });

  it("correctly NFT name", async function () {
    expect(await missPh.name()).to.be.equal(tokenName);
    expect(await missPh.symbol()).to.be.equal(tokenSymbol);
  });

  it("correctly mints a NFT", async function () {
    expect(await missPh.connect(owner).directMint(bob.address, 1)).to.emit(
      missPh,
      "Transfer"
    );
    expect(await missPh.balanceOf(bob.address)).to.equal(1);
  });

  it("returns correct balanceOf", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    expect(await missPh.balanceOf(bob.address)).to.equal(1);
    await missPh.connect(owner).directMint(bob.address, id2);
    expect(await missPh.balanceOf(bob.address)).to.equal(2);
  });

  it("throws when trying to get count of NFTs owned by 0x0 address", async function () {
    await expect(missPh.balanceOf(zeroAddress)).to.be.reverted;
  });

  it("throws when trying to mint 2 NFTs with the same ids", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    await expect(missPh.connect(owner).directMint(bob.address, id1)).to.be
      .reverted;
  });

  it("throws when trying to mint NFT to 0x0 address", async function () {
    await expect(missPh.connect(owner).directMint(zeroAddress, id1)).to.be
      .reverted;
  });

  it("finds the correct owner of missPh id", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    expect(await missPh.ownerOf(id1)).to.equal(bob.address);
  });

  it("throws when trying to find owner od non-existing NFT id", async function () {
    await expect(missPh.ownerOf(id1)).to.be.reverted;
  });

  it("correctly approves account", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    expect(await missPh.connect(bob).approve(sara.address, id1)).to.emit(
      missPh,
      "Approval"
    );
    expect(await missPh.getApproved(id1)).to.equal(sara.address);
  });

  it("correctly cancels approval", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    await missPh.connect(bob).approve(sara.address, id1);
    await missPh.connect(bob).approve(zeroAddress, id1);
    expect(await missPh.getApproved(id1)).to.equal(zeroAddress);
  });

  it("throws when trying to get approval of non-existing NFT id", async function () {
    await expect(missPh.getApproved(id1)).to.be.reverted;
  });

  it("throws when trying to approve NFT ID from a third party", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    await expect(missPh.connect(sara).approve(sara.address, id1)).to.be
      .reverted;
  });

  it("correctly sets an operator", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    expect(
      await missPh.connect(bob).setApprovalForAll(sara.address, true)
    ).to.emit(missPh, "ApprovalForAll");
    expect(await missPh.isApprovedForAll(bob.address, sara.address)).to.equal(
      true
    );
  });

  it("correctly sets then cancels an operator", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    await missPh.connect(bob).setApprovalForAll(sara.address, true);
    await missPh.connect(bob).setApprovalForAll(sara.address, false);
    expect(await missPh.isApprovedForAll(bob.address, sara.address)).to.equal(
      false
    );
  });

  it("correctly transfers NFT from owner", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    expect(
      await missPh.connect(bob).transferFrom(bob.address, sara.address, id1)
    ).to.emit(missPh, "Transfer");
    expect(await missPh.balanceOf(bob.address)).to.equal(0);
    expect(await missPh.balanceOf(sara.address)).to.equal(1);
    expect(await missPh.ownerOf(id1)).to.equal(sara.address);
  });

  it("correctly transfers NFT from approved address", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    await missPh.connect(bob).approve(sara.address, id1);
    await missPh.connect(sara).transferFrom(bob.address, jane.address, id1);
    expect(await missPh.balanceOf(bob.address)).to.equal(0);
    expect(await missPh.balanceOf(jane.address)).to.equal(1);
    expect(await missPh.ownerOf(id1)).to.equal(jane.address);
  });

  it("correctly transfers NFT as operator", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    await missPh.connect(bob).setApprovalForAll(sara.address, true);
    await missPh.connect(sara).transferFrom(bob.address, jane.address, id1);
    expect(await missPh.balanceOf(bob.address)).to.equal(0);
    expect(await missPh.balanceOf(jane.address)).to.equal(1);
    expect(await missPh.ownerOf(id1)).to.equal(jane.address);
  });

  it("throws when trying to transfer NFT as an address that is not owner, approved or operator", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    await expect(
      missPh.connect(sara).transferFrom(bob.address, jane.address, id1)
    ).to.be.reverted;
  });

  it("throws when trying to transfer NFT to a zero address", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    await expect(
      missPh.connect(bob).transferFrom(bob.address, zeroAddress, id1)
    ).to.be.reverted;
  });

  it("throws when trying to transfer an invalid NFT", async function () {
    await expect(
      missPh.connect(bob).transferFrom(bob.address, sara.address, id1)
    ).to.be.reverted;
  });

  it("throws when trying to transfer an invalid NFT", async function () {
    await expect(
      missPh.connect(bob).transferFrom(bob.address, sara.address, id1)
    ).to.be.reverted;
  });

  it("correctly safe transfers NFT from owner", async function () {
    await missPh.connect(owner).directMint(bob.address, id1);
    expect(
      await missPh
        .connect(bob)
        ["safeTransferFrom(address,address,uint256)"](
          bob.address,
          sara.address,
          id1
        )
    ).to.emit(missPh, "Transfer");
    expect(await missPh.balanceOf(bob.address)).to.equal(0);
    expect(await missPh.balanceOf(sara.address)).to.equal(1);
    expect(await missPh.ownerOf(id1)).to.equal(sara.address);
  });
});

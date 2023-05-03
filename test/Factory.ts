import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Factory", () => {

  async function deploy() {
    const [_, user1, user2, user3] = await ethers.getSigners();

    const GlacierToken = await ethers.getContractFactory("GlacierToken");
    const glacierToken = await GlacierToken.deploy("gCLP", "gCLP", 8)

    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.deploy(glacierToken.address);

    await factory.grantRole(factory.MINTER_ROLE(), user1.getAddress());
    await factory.grantRole(factory.BURNER_ROLE(), user2.getAddress());
    await factory.addMintRequest(100000000000000, "426fd646-c27b-44ad-b48c-6cdd707c5f03");

    return { factory, user1, user2, user3 }
  };

  describe("Roles", function () {
    it("Should add grant role minter", async function () {
      const { factory, user3 } = await loadFixture(deploy);

      await expect(
        factory.grantRole(factory.MINTER_ROLE(), user3.getAddress())
      ).not.to.be.reverted;
    });

    it("Should add grant role burner", async function () {
      const { factory, user3 } = await loadFixture(deploy);

      await expect(
        factory.grantRole(factory.BURNER_ROLE(), user3.getAddress())
      ).not.to.be.reverted;
    });

    it("Shouldn't add grant role minter", async function () {
      const { factory, user2, user3 } = await loadFixture(deploy);

      await expect(
        factory.connect(user3).grantRole(factory.MINTER_ROLE(), user2.getAddress())
      ).to.be.revertedWith("AccessControl: account 0x90f79bf6eb2c4f870365e785982e1f101e93b906 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000")
    });

    it("Shouldn't add grant role burner", async function () {
      const { factory, user2, user3 } = await loadFixture(deploy);

      await expect(
        factory.connect(user2).grantRole(factory.BURNER_ROLE(), user3.getAddress())
      ).to.be.revertedWith("AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000")
    });

    it("Should add grant role default admin", async function () {
      const { factory, user3 } = await loadFixture(deploy);

      await expect(
        factory.grantRole(factory.DEFAULT_ADMIN_ROLE(), user3.getAddress())
      ).not.to.be.reverted;
    });

    it("Should add grant role minter after granted default admin role", async function () {
      const { factory, user2, user3 } = await loadFixture(deploy);
      factory.grantRole(factory.DEFAULT_ADMIN_ROLE(), user3.getAddress())
      await expect(
        factory.connect(user3).grantRole(factory.MINTER_ROLE(), user2.getAddress())
      ).not.to.be.reverted;
    });

    it("Should add grant role burner after granted default admin role", async function () {
      const { factory, user2, user3 } = await loadFixture(deploy);
      factory.grantRole(factory.DEFAULT_ADMIN_ROLE(), user2.getAddress())
      await expect(
        factory.connect(user2).grantRole(factory.BURNER_ROLE(), user3.getAddress())
      ).not.to.be.reverted;
    });
  });

  describe("AddMintRequest", function () {
    describe("Validations", function () {
      it("Should revert with a non minter", async function () {
        const { factory, user2 } = await loadFixture(deploy);

        await expect(
          factory.connect(user2).addMintRequest(
            100000000000000,
            "426fd646-c27b-44ad-b48c-6cdd707c5f03"
          )).to.be.revertedWith("AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6")
      });

      it("Should revert with a duplicated txId", async function () {
        const { factory, user1 } = await loadFixture(deploy);

        await expect(
          factory.connect(user1).addMintRequest(
            200000000000000,
            "426fd646-c27b-44ad-b48c-6cdd707c5f03"
          )
        ).to.be.revertedWith("AddMintRequest: txId 426fd646-c27b-44ad-b48c-6cdd707c5f03 amount 200000000000000 requested by 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 already sent it by 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")
      });

      it("Shouldn't fail if txId it not already sent it", async function () {
        const { factory, user1 } = await loadFixture(deploy);

        await expect(
          factory.connect(user1).addMintRequest(
            100000000000000,
            "65f7b547-a87b-4631-a767-e0655a97c705"
          )).not.to.be.reverted;
      });
    });

    describe("Events", function () {
      it("Should emit an event on addMintRequest", async function () {
        const { factory, user1 } = await loadFixture(deploy);
        const txId = "65f7b547-a87b-4631-a767-e0655a97c705"

        await expect(
          factory.connect(user1).addMintRequest(
            100000000000000,
            txId
          )).to.emit(factory, "MintRequestAdded")
          .withArgs(txId, anyValue);
      });
    });
  });

});


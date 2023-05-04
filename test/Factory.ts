import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Factory', () => {
  async function deploy() {
    const [_, user1, user2, user3] = await ethers.getSigners();

    const GlacierToken = await ethers.getContractFactory('GlacierToken');
    const glacierToken = await GlacierToken.deploy('gCLP', 'gCLP', 8);

    const Factory = await ethers.getContractFactory('Factory');
    const factory = await Factory.deploy(glacierToken.address);

    await factory.grantRole(factory.MINTER_ROLE(), user1.getAddress());
    await factory.grantRole(factory.BURNER_ROLE(), user2.getAddress());
    await factory.addMintRequest(100000000000000, '426fd646-c27b-44ad-b48c-6cdd707c5f03');

    return { factory, user1, user2, user3 };
  }

  describe('Roles', function () {
    it('Should add grant role minter', async function () {
      const { factory, user3 } = await loadFixture(deploy);

      await expect(factory.grantRole(factory.MINTER_ROLE(), user3.getAddress())).not.to.be.reverted;
    });

    it('Should add grant role burner', async function () {
      const { factory, user3 } = await loadFixture(deploy);

      await expect(factory.grantRole(factory.BURNER_ROLE(), user3.getAddress())).not.to.be.reverted;
    });

    it("Shouldn't add grant role minter", async function () {
      const { factory, user2, user3 } = await loadFixture(deploy);

      await expect(factory.connect(user3).grantRole(factory.MINTER_ROLE(), user2.getAddress())).to.be.revertedWith(
        'AccessControl: account 0x90f79bf6eb2c4f870365e785982e1f101e93b906 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000',
      );
    });

    it("Shouldn't add grant role burner", async function () {
      const { factory, user2, user3 } = await loadFixture(deploy);

      await expect(factory.connect(user2).grantRole(factory.BURNER_ROLE(), user3.getAddress())).to.be.revertedWith(
        'AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000',
      );
    });

    it('Should add grant role default admin', async function () {
      const { factory, user3 } = await loadFixture(deploy);

      await expect(factory.grantRole(factory.DEFAULT_ADMIN_ROLE(), user3.getAddress())).not.to.be.reverted;
    });

    it('Should add grant role minter after granted default admin role', async function () {
      const { factory, user2, user3 } = await loadFixture(deploy);
      factory.grantRole(factory.DEFAULT_ADMIN_ROLE(), user3.getAddress());
      await expect(factory.connect(user3).grantRole(factory.MINTER_ROLE(), user2.getAddress())).not.to.be.reverted;
    });

    it('Should add grant role burner after granted default admin role', async function () {
      const { factory, user2, user3 } = await loadFixture(deploy);
      factory.grantRole(factory.DEFAULT_ADMIN_ROLE(), user2.getAddress());
      await expect(factory.connect(user2).grantRole(factory.BURNER_ROLE(), user3.getAddress())).not.to.be.reverted;
    });
  });
});

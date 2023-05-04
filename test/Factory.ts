import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { scenario } from './global';

describe('Factory', () => {
  describe('Roles', () => {
    it('Should add grant role minter', async () => {
      const { gCLPFactory, burner } = await loadFixture(scenario);

      await expect(gCLPFactory.grantRole(gCLPFactory.MINTER_ROLE(), burner.getAddress())).not.to.be.reverted;
    });

    it('Should add grant role burner', async () => {
      const { gCLPFactory, minter } = await loadFixture(scenario);

      await expect(gCLPFactory.grantRole(gCLPFactory.BURNER_ROLE(), minter.getAddress())).not.to.be.reverted;
    });

    it("Shouldn't add grant role minter", async () => {
      const { gCLPFactory, minter, burner } = await loadFixture(scenario);

      await expect(gCLPFactory.connect(minter).grantRole(gCLPFactory.MINTER_ROLE(), burner.getAddress())).to.be
        .reverted;
    });

    it("Shouldn't add grant role burner", async () => {
      const { gCLPFactory, minter, burner } = await loadFixture(scenario);

      await expect(gCLPFactory.connect(burner).grantRole(gCLPFactory.BURNER_ROLE(), minter.getAddress())).to.be
        .reverted;
    });

    it('Should add grant role default admin', async () => {
      const { gCLPFactory, admin, minter } = await loadFixture(scenario);

      await expect(gCLPFactory.connect(admin).grantRole(gCLPFactory.DEFAULT_ADMIN_ROLE(), minter.getAddress())).not.to
        .be.reverted;
    });

    it('Should add grant role minter after granted default admin role', async function () {
      const { gCLPFactory, minter, burner } = await loadFixture(scenario);
      await gCLPFactory.grantRole(gCLPFactory.DEFAULT_ADMIN_ROLE(), minter.getAddress());
      await expect(gCLPFactory.connect(minter).grantRole(gCLPFactory.MINTER_ROLE(), burner.getAddress())).not.to.be
        .reverted;
    });

    it('Should add grant role burner after granted default admin role', async function () {
      const { gCLPFactory, minter, burner } = await loadFixture(scenario);
      await gCLPFactory.grantRole(gCLPFactory.DEFAULT_ADMIN_ROLE(), burner.getAddress());
      await expect(gCLPFactory.connect(burner).grantRole(gCLPFactory.BURNER_ROLE(), minter.getAddress())).not.to.be
        .reverted;
    });
  });
});

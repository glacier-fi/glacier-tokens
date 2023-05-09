import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { scenario } from './global';

describe('Factory', () => {
  describe('Roles', () => {
    it('Should add grant user role', async () => {
      const { gCLPFactory, burner } = await loadFixture(scenario);

      await expect(gCLPFactory.grantRole(gCLPFactory.USER_ROLE(), burner.getAddress())).not.to.be.reverted;
    });

    it("Shouldn't add grant user role", async () => {
      const { gCLPFactory, minter, burner } = await loadFixture(scenario);

      await expect(gCLPFactory.connect(minter).grantRole(gCLPFactory.USER_ROLE(), burner.getAddress())).to.be.reverted;
    });

    it('Should add grant role default admin', async () => {
      const { gCLPFactory, admin, minter } = await loadFixture(scenario);

      await expect(gCLPFactory.connect(admin).grantRole(gCLPFactory.DEFAULT_ADMIN_ROLE(), minter.getAddress())).not.to
        .be.reverted;
    });

    it('Should add grant user role after granted default admin role', async function () {
      const { gCLPFactory, minter, burner } = await loadFixture(scenario);
      await gCLPFactory.grantRole(gCLPFactory.DEFAULT_ADMIN_ROLE(), minter.getAddress());
      await expect(gCLPFactory.connect(minter).grantRole(gCLPFactory.USER_ROLE(), burner.getAddress())).not.to.be
        .reverted;
    });
  });
});

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { scenario } from './global';

describe('RequestToken', () => {
  describe('Roles', () => {
    it('Should add grant user role', async () => {
      const { gCLPRequestToken, burner } = await loadFixture(scenario);

      await expect(gCLPRequestToken.grantRole(gCLPRequestToken.USER_ROLE(), burner.getAddress())).not.to.be.reverted;
    });

    it("Shouldn't add grant user role", async () => {
      const { gCLPRequestToken, minter, burner } = await loadFixture(scenario);

      await expect(gCLPRequestToken.connect(minter).grantRole(gCLPRequestToken.USER_ROLE(), burner.getAddress())).to.be
        .reverted;
    });

    it('Should add grant role default admin', async () => {
      const { gCLPRequestToken, deployer, minter } = await loadFixture(scenario);

      await expect(
        gCLPRequestToken.connect(deployer).grantRole(gCLPRequestToken.DEFAULT_ADMIN_ROLE(), minter.getAddress()),
      ).not.to.be.reverted;
    });

    it('Should add grant user role after granted default admin role', async function () {
      const { gCLPRequestToken, minter, burner } = await loadFixture(scenario);
      await gCLPRequestToken.grantRole(gCLPRequestToken.DEFAULT_ADMIN_ROLE(), minter.getAddress());
      await expect(gCLPRequestToken.connect(minter).grantRole(gCLPRequestToken.USER_ROLE(), burner.getAddress())).not.to
        .be.reverted;
    });
  });
});

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, ids, ZERO_ADDRESS } from './global';

describe('Factory', () => {
  describe('ConfirmMintRequest', function () {
    describe('Validations', function () {
      it('Should revert with a factory without token access', async () => {
        const { id0 } = ids();
        const { gCLPFactory, gCLP, confirmer } = await loadFixture(scenario);
        await gCLP.revokeRole(gCLP.MINTER_ROLE(), gCLPFactory.address);

        await expect(gCLPFactory.connect(confirmer).confirmMintRequest(id0)).to.be.revertedWith(
          Errors.UNAUTHORIZED_TOKEN_ACCESS,
        );
      });

      it('Should revert with a non confirmer', async function () {
        const { id0 } = ids();
        const { gCLPFactory, burner } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(burner).confirmMintRequest(id0)).to.be.revertedWith(Errors.UNAUTHORIZED);
      });

      it('Should revert with id that does not exists', async () => {
        const { id1 } = ids();
        const { gCLPFactory, confirmer } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(confirmer).confirmMintRequest(id1)).to.be.revertedWith(Errors.NOT_FOUND);
      });

      it('Should revert if request is not pending', async () => {
        const { id0 } = ids();
        const { gCLPFactory, user, confirmer } = await loadFixture(scenario);

        await gCLPFactory.connect(user).cancelMintRequest(id0);

        await expect(gCLPFactory.connect(confirmer).confirmMintRequest(id0)).to.be.revertedWith(
          Errors.REQUEST_NOT_PENDING,
        );
      });

      it('Should Not fail with a pending request', async () => {
        const { id0 } = ids();
        const { gCLPFactory, confirmer } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(confirmer).confirmMintRequest(id0)).not.to.be.reverted;
      });
    });

    describe('Events', () => {
      it('Should emit an event on confirmMintRequest', async () => {
        const { id0 } = ids();
        const { gCLPFactory, confirmer } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(confirmer).confirmMintRequest(id0)).to.emit(
          gCLPFactory,
          'MintRequestConfirmed',
        );
      });
    });
  });
});

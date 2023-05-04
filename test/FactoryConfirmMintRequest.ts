import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, factoryDeployScenario, ids } from './global';

describe('Factory', () => {
  describe('ConfirmMintRequest', function () {
    describe('Validations', function () {
      it('Should revert with a non confirmer', async function () {
        const { id0 } = ids();
        const { factory, burner } = await loadFixture(factoryDeployScenario);

        await expect(factory.connect(burner).confirmMintRequest(id0)).to.be.revertedWith(Errors.UNAUTHORIZED);
      });

      it('Should revert with id that does not exists', async () => {
        const { id1 } = ids();
        const { factory, confirmer } = await loadFixture(factoryDeployScenario);

        await expect(factory.connect(confirmer).confirmMintRequest(id1)).to.be.revertedWith(Errors.NOT_FOUND);
      });

      it('Should revert if request is not pending', async () => {
        const { id0 } = ids();
        const { factory, admin, confirmer } = await loadFixture(factoryDeployScenario);

        await factory.connect(admin).cancelMintRequest(id0);

        await expect(factory.connect(confirmer).confirmMintRequest(id0)).to.be.revertedWith(Errors.REQUEST_NOT_PENDING);
      });

      it('Should Not fail with a pending request', async () => {
        const { id0 } = ids();
        const { factory, confirmer } = await loadFixture(factoryDeployScenario);

        await expect(factory.connect(confirmer).confirmMintRequest(id0)).not.to.be.reverted;
      });
    });

    describe('Events', () => {
      it('Should emit an event on confirmMintRequest', async () => {
        const { id0 } = ids();
        const { factory, confirmer } = await loadFixture(factoryDeployScenario);

        await expect(factory.connect(confirmer).confirmMintRequest(id0)).to.emit(factory, 'MintRequestConfirmed');
      });
    });
  });
});

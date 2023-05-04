import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, factoryDeployScenario, ids } from './global';

describe('Factory', () => {
  describe('CancelMintRequest', () => {
    describe('Validations', () => {
      it('Should revert with a non minter', async () => {
        const { id0 } = ids();
        const { factory, burner } = await loadFixture(factoryDeployScenario);

        await expect(factory.connect(burner).cancelMintRequest(id0)).to.be.revertedWith(Errors.UNAUTHORIZED);
      });

      it('Should revert with id that does not exists', async () => {
        const { id2 } = ids();
        const { factory, minter } = await loadFixture(factoryDeployScenario);

        await expect(factory.connect(minter).cancelMintRequest(id2)).to.be.revertedWith(Errors.NOT_FOUND);
      });

      it('Should revert with sender not equal requester', async () => {
        const { id0 } = ids();
        const { factory, minter } = await loadFixture(factoryDeployScenario);

        await expect(factory.connect(minter).cancelMintRequest(id0)).to.be.revertedWith(
          Errors.SENDER_NOT_EQUAL_REQUESTER,
        );
      });

      it('Should revert if request is not pending', async () => {
        const { id0 } = ids();
        const { factory, admin } = await loadFixture(factoryDeployScenario);

        await factory.connect(admin).cancelMintRequest(id0);

        await expect(factory.connect(admin).cancelMintRequest(id0)).to.be.revertedWith(Errors.REQUEST_NOT_PENDING);
      });

      it('Should Not fail with a pending request', async () => {
        const { id0 } = ids();
        const { factory, admin } = await loadFixture(factoryDeployScenario);

        await expect(factory.connect(admin).cancelMintRequest(id0)).not.to.be.reverted;
      });
    });

    describe('Events', () => {
      it('Should emit an event on cancelMintRequest', async () => {
        const { id0 } = ids();
        const { factory, admin } = await loadFixture(factoryDeployScenario);

        await expect(factory.connect(admin).cancelMintRequest(id0)).to.emit(factory, 'MintRequestCancelled');
      });
    });
  });
});

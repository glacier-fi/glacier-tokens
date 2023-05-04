import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, ids } from './global';

describe('Factory', () => {
  describe('RejectMintRequest', () => {
    describe('Validations', () => {
      it('Should revert with a non confirmer', async () => {
        const { id0 } = ids();
        const { gCLPFactory, burner } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(burner).rejectMintRequest(id0)).to.be.revertedWith(Errors.UNAUTHORIZED);
      });

      it('Should revert with id that does not exists', async () => {
        const { id1 } = ids();
        const { gCLPFactory, confirmer } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(confirmer).rejectMintRequest(id1)).to.be.revertedWith(Errors.NOT_FOUND);
      });

      it('Should revert if request is not pending', async () => {
        const { id0 } = ids();
        const { gCLPFactory, admin, confirmer } = await loadFixture(scenario);

        await gCLPFactory.connect(admin).cancelMintRequest(id0);

        await expect(gCLPFactory.connect(confirmer).rejectMintRequest(id0)).to.be.revertedWith(
          Errors.REQUEST_NOT_PENDING,
        );
      });

      it('Should Not fail with a pending request', async () => {
        const { id0 } = ids();
        const { gCLPFactory, confirmer } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(confirmer).rejectMintRequest(id0)).not.to.be.reverted;
      });
    });

    describe('Events', () => {
      it('Should emit an event on rejectMintRequest', async () => {
        const { id0 } = ids();
        const { gCLPFactory, confirmer } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(confirmer).rejectMintRequest(id0)).to.emit(gCLPFactory, 'MintRequestRejected');
      });
    });
  });
});
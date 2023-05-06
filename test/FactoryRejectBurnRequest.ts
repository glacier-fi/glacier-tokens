import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, ids, RequestType } from './global';

describe('Factory', () => {
  describe('RejectBurnRequest', () => {
    describe('Validations', () => {
      it('Should revert with a non confirmer', async () => {
        const { id0 } = ids();
        const { gCLPFactory, burner } = await loadFixture(scenario);

        expect(gCLPFactory.connect(burner).rejectRequest(RequestType.BURN, id0)).to.be.revertedWith(
          Errors.UNAUTHORIZED,
        );
      });

      it('Should revert with id that does not exists', async () => {
        const { id1 } = ids();
        const { gCLPFactory, confirmer } = await loadFixture(scenario);

        expect(gCLPFactory.connect(confirmer).rejectRequest(RequestType.BURN, id1)).to.be.revertedWith(
          Errors.NOT_FOUND,
        );
      });

      it('Should revert if request is not pending', async () => {
        const { id0 } = ids();
        const { gCLPFactory, user, confirmer } = await loadFixture(scenario);

        await gCLPFactory.connect(user).cancelMintRequest(id0);

        expect(gCLPFactory.connect(confirmer).rejectRequest(RequestType.BURN, id0)).to.be.revertedWith(
          Errors.REQUEST_NOT_PENDING,
        );
      });

      it('Should Not fail with a pending request', async () => {
        const { id0 } = ids();
        const { gCLPFactory, confirmer } = await loadFixture(scenario);

        expect(await gCLPFactory.connect(confirmer).rejectRequest(RequestType.BURN, id0)).not.to.be.reverted;
      });
    });

    describe('Events', () => {
      it('Should emit an event on rejectRequest', async () => {
        const { id0 } = ids();
        const { gCLPFactory, confirmer } = await loadFixture(scenario);

        expect(await gCLPFactory.connect(confirmer).rejectRequest(RequestType.BURN, id0)).to.emit(
          gCLPFactory,
          'BurnRequestRejected',
        );
      });
    });
  });
});

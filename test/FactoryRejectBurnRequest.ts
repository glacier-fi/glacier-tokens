import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, RequestType } from './global';

describe('Factory', () => {
  describe('RejectBurnRequest', () => {
    describe('Validations', () => {
      it('Should revert with a non confirmer', async () => {
        const { gCLPFactory, user1, id1 } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(user1).rejectRequest(RequestType.BURN, id1)).to.be.revertedWith(
          Errors.UNAUTHORIZED,
        );
      });

      it('Should revert with id that does not exists', async () => {
        const { gCLPFactory, confirmer, id2 } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(confirmer).rejectRequest(RequestType.BURN, id2)).to.be.revertedWith(
          Errors.NOT_FOUND,
        );
      });

      it('Should revert if request is not pending', async () => {
        const { gCLPFactory, confirmer, id1 } = await loadFixture(scenario);

        await gCLPFactory.connect(confirmer).confirmRequest(RequestType.BURN, id1);

        await expect(gCLPFactory.connect(confirmer).rejectRequest(RequestType.BURN, id1)).to.be.revertedWith(
          Errors.REQUEST_NOT_PENDING,
        );
      });

      it('Should revert with id that with a non request type burn', async () => {
        const { gCLPFactory, user, confirmer, id2 } = await loadFixture(scenario);
        await gCLPFactory.connect(user).addRequest(RequestType.MINT, 100000000000000, id2);
        await expect(gCLPFactory.connect(confirmer).rejectRequest(RequestType.BURN, id2)).to.be.revertedWith(
          Errors.SENDER_REQUEST_TYPE_NOT_EQUAL_REQUESTER_REQUEST_TYPE,
        );
      });

      it('Should Not fail with a pending request', async () => {
        const { gCLP, gCLPFactory, confirmer, user, id1 } = await loadFixture(scenario);

        expect(await gCLP.balanceOf(gCLPFactory.address)).equals(50000000000000);
        expect(await gCLP.balanceOf(user.address)).equals(50000000000000);
        expect(await gCLPFactory.connect(confirmer).rejectRequest(RequestType.BURN, id1)).not.to.be.reverted;
        expect(await gCLP.balanceOf(user.address)).equals(100000000000000);
        expect(await gCLP.balanceOf(gCLPFactory.address)).equals(0);
      });
    });

    describe('Events', () => {
      it('Should emit an event on rejectBurnRequest', async () => {
        const { gCLPFactory, confirmer, id1 } = await loadFixture(scenario);

        expect(await gCLPFactory.connect(confirmer).rejectRequest(RequestType.BURN, id1)).to.emit(
          gCLPFactory,
          'RequestRejected',
        );
      });
    });
  });
});

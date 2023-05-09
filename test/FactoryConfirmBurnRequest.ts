import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, RequestType } from './global';

describe('Factory', () => {
  describe('ConfirmBurnRequest', function () {
    describe('Validations', function () {
      it('Should revert with a non confirmer', async function () {
        const { gCLPFactory, burner, id1 } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(burner).confirmRequest(RequestType.BURN, id1)).to.be.revertedWith(
          Errors.UNAUTHORIZED,
        );
      });

      it('Should revert with id that does not exists', async () => {
        const { gCLPFactory, confirmer, id2 } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(confirmer).confirmRequest(RequestType.BURN, id2)).to.be.revertedWith(
          Errors.NOT_FOUND,
        );
      });

      it('Should revert with id that with a non request type burn', async () => {
        const { gCLPFactory, user, confirmer, id2 } = await loadFixture(scenario);
        await gCLPFactory.connect(user).addRequest(RequestType.MINT, 100000000000000, id2);
        await expect(gCLPFactory.connect(confirmer).confirmRequest(RequestType.BURN, id2)).to.be.revertedWith(
          Errors.SENDER_REQUEST_TYPE_NOT_EQUAL_REQUESTER_REQUEST_TYPE,
        );
      });

      it('Should revert if request is not pending', async () => {
        const { gCLPFactory, confirmer, id1 } = await loadFixture(scenario);
        await gCLPFactory.connect(confirmer).confirmRequest(RequestType.BURN, id1);
        await expect(gCLPFactory.connect(confirmer).confirmRequest(RequestType.BURN, id1)).to.be.revertedWith(
          Errors.REQUEST_NOT_PENDING,
        );
      });

      it('Should Not fail with a pending request', async () => {
        const { gCLPFactory, gCLP, confirmer, id1 } = await loadFixture(scenario);

        expect(await gCLP.balanceOf(gCLPFactory.address)).equals(50000000000000);
        await expect(gCLPFactory.connect(confirmer).confirmRequest(RequestType.BURN, id1)).not.to.be.reverted;
        expect(await gCLP.balanceOf(gCLPFactory.address)).equals(0);
      });
    });

    describe('Events', () => {
      it('Should emit an event on confirmBurnRequest', async () => {
        const { gCLPFactory, confirmer, id1 } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(confirmer).confirmRequest(RequestType.BURN, id1)).to.emit(
          gCLPFactory,
          'RequestConfirmed',
        );
      });
    });
  });
});

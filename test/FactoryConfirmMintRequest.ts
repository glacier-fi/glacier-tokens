import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, RequestType } from './global';

describe('Factory', () => {
  describe('ConfirmMintRequest', function () {
    describe('Validations', function () {
      it('Should revert with a factory without token access', async () => {
        const { gCLPFactory, gCLP, confirmer, id2, user } = await loadFixture(scenario);
        await gCLPFactory.connect(user).addRequest(RequestType.MINT, 100000000000000, id2);
        await gCLP.revokeRole(gCLP.MINTER_ROLE(), gCLPFactory.address);

        await expect(gCLPFactory.connect(confirmer).confirmRequest(RequestType.MINT, id2)).to.be.revertedWith(
          Errors.UNAUTHORIZED_TOKEN_ACCESS,
        );
      });

      it('Should revert with a non confirmer', async function () {
        const { gCLPFactory, burner, id0 } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(burner).confirmRequest(RequestType.MINT, id0)).to.be.revertedWith(
          Errors.UNAUTHORIZED,
        );
      });

      it('Should revert with id that does not exists', async () => {
        const { gCLPFactory, confirmer, id2 } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(confirmer).confirmRequest(RequestType.MINT, id2)).to.be.revertedWith(
          Errors.NOT_FOUND,
        );
      });

      it('Should revert with id that with a non request type mint', async () => {
        const { gCLPFactory, confirmer, id1 } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(confirmer).confirmRequest(RequestType.MINT, id1)).to.be.revertedWith(
          Errors.SENDER_REQUEST_TYPE_NOT_EQUAL_REQUESTER_REQUEST_TYPE,
        );
      });

      it('Should revert if request is not pending', async () => {
        const { gCLPFactory, confirmer, id0 } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(confirmer).confirmRequest(RequestType.MINT, id0)).to.be.revertedWith(
          Errors.REQUEST_NOT_PENDING,
        );
      });

      it('Should Not fail with a pending request', async () => {
        const { gCLPFactory, gCLP, user, confirmer, id2 } = await loadFixture(scenario);
        const amount = 100000000000000;

        expect(await gCLP.balanceOf(user.address)).equals(50000000000000);
        await gCLPFactory.connect(user).addRequest(RequestType.MINT, amount, id2);
        await expect(gCLPFactory.connect(confirmer).confirmRequest(RequestType.MINT, id2)).not.to.be.reverted;
        expect(await gCLP.balanceOf(user.address)).equals(150000000000000);
      });
    });

    describe('Events', () => {
      it('Should emit an event on confirmMintRequest', async () => {
        const { gCLPFactory, user, confirmer, id2 } = await loadFixture(scenario);
        await gCLPFactory.connect(user).addRequest(RequestType.MINT, 100000000000000, id2);

        await expect(gCLPFactory.connect(confirmer).confirmRequest(RequestType.MINT, id2)).to.emit(
          gCLPFactory,
          'RequestConfirmed',
        );
      });
    });
  });
});

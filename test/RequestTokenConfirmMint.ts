import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, RequestType } from './global';

describe('RequestTokenMethod', () => {
  describe('confirmMint', function () {
    describe('Validations', function () {
      it('Should revert with a factory without token access', async () => {
        const { gCLPRequestToken, gCLP, confirmer, id2, user } = await loadFixture(scenario);
        await gCLPRequestToken.connect(user).addRequest(RequestType.MINT, 100000000000000, id2);
        await gCLP.revokeRole(gCLP.MINTER_ROLE(), gCLPRequestToken.address);

        await expect(gCLPRequestToken.connect(confirmer).confirmRequest(RequestType.MINT, id2)).to.be.revertedWith(
          Errors.UNAUTHORIZED_TOKEN_ACCESS,
        );
      });

      it('Should revert with a non confirmer', async function () {
        const { gCLPRequestToken, burner, id0 } = await loadFixture(scenario);

        await expect(gCLPRequestToken.connect(burner).confirmRequest(RequestType.MINT, id0)).to.be.revertedWith(
          Errors.UNAUTHORIZED,
        );
      });

      it('Should revert with id that does not exists', async () => {
        const { gCLPRequestToken, confirmer, id2 } = await loadFixture(scenario);

        await expect(gCLPRequestToken.connect(confirmer).confirmRequest(RequestType.MINT, id2)).to.be.revertedWith(
          Errors.NOT_FOUND,
        );
      });

      it('Should revert with id that with a non request type mint', async () => {
        const { gCLPRequestToken, confirmer, id1 } = await loadFixture(scenario);

        await expect(gCLPRequestToken.connect(confirmer).confirmRequest(RequestType.MINT, id1)).to.be.revertedWith(
          Errors.SENDER_REQUEST_TYPE_NOT_EQUAL_REQUESTER_REQUEST_TYPE,
        );
      });

      it('Should revert if request is not pending', async () => {
        const { gCLPRequestToken, confirmer, id0 } = await loadFixture(scenario);

        await expect(gCLPRequestToken.connect(confirmer).confirmRequest(RequestType.MINT, id0)).to.be.revertedWith(
          Errors.REQUEST_NOT_PENDING,
        );
      });

      it('Should Not fail with a pending request', async () => {
        const { gCLPRequestToken, gCLP, user, confirmer, id2 } = await loadFixture(scenario);
        const amount = 100000000000000;

        expect(await gCLP.balanceOf(user.address)).equals(50000000000000);
        await gCLPRequestToken.connect(user).addRequest(RequestType.MINT, amount, id2);
        await expect(gCLPRequestToken.connect(confirmer).confirmRequest(RequestType.MINT, id2)).not.to.be.reverted;
        expect(await gCLP.balanceOf(user.address)).equals(150000000000000);
      });
    });

    describe('Events', () => {
      it('Should emit an event on confirmMintRequest', async () => {
        const { gCLPRequestToken, user, confirmer, id2 } = await loadFixture(scenario);
        await gCLPRequestToken.connect(user).addRequest(RequestType.MINT, 100000000000000, id2);

        await expect(gCLPRequestToken.connect(confirmer).confirmRequest(RequestType.MINT, id2)).to.emit(
          gCLPRequestToken,
          'RequestConfirmed',
        );
      });
    });
  });
});

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, RequestType } from './global';

describe('RequestTokenMethod', () => {
  describe('cancelMint', () => {
    describe('Validations', () => {
      it('Should revert with a non user role', async () => {
        const { gCLPRequestToken, user, user1, id2 } = await loadFixture(scenario);
        await gCLPRequestToken.connect(user).addRequest(RequestType.MINT, 100000000000000, id2);

        await expect(gCLPRequestToken.connect(user1).cancelRequest(RequestType.MINT, id2)).to.be.revertedWith(
          Errors.UNAUTHORIZED,
        );
      });

      it('Should revert with id that does not exists', async () => {
        const { gCLPRequestToken, minter, id2 } = await loadFixture(scenario);

        await expect(gCLPRequestToken.connect(minter).cancelRequest(RequestType.MINT, id2)).to.be.revertedWith(
          Errors.NOT_FOUND,
        );
      });

      it('Should revert with sender not equal requester', async () => {
        const { gCLPRequestToken, user, minter, id2 } = await loadFixture(scenario);
        await gCLPRequestToken.connect(user).addRequest(RequestType.MINT, 100000000000000, id2);

        await expect(gCLPRequestToken.connect(minter).cancelRequest(RequestType.MINT, id2)).to.be.revertedWith(
          Errors.SENDER_NOT_EQUAL_REQUESTER,
        );
      });

      it('Should revert with id that with a non request type mint', async () => {
        const { gCLPRequestToken, user, id1 } = await loadFixture(scenario);

        await expect(gCLPRequestToken.connect(user).cancelRequest(RequestType.MINT, id1)).to.be.revertedWith(
          Errors.SENDER_REQUEST_TYPE_NOT_EQUAL_REQUESTER_REQUEST_TYPE,
        );
      });

      it('Should revert if request is not pending', async () => {
        const { gCLPRequestToken, user, id0 } = await loadFixture(scenario);

        await expect(gCLPRequestToken.connect(user).cancelRequest(RequestType.MINT, id0)).to.be.revertedWith(
          Errors.REQUEST_NOT_PENDING,
        );
      });

      it('Should Not fail with a pending request', async () => {
        const { gCLPRequestToken, gCLP, user, id2 } = await loadFixture(scenario);
        await gCLPRequestToken.connect(user).addRequest(RequestType.MINT, 100000000000000, id2);

        expect(await gCLP.balanceOf(user.address)).equals(50000000000000);
        await expect(gCLPRequestToken.connect(user).cancelRequest(RequestType.MINT, id2)).not.to.be.reverted;
        expect(await gCLP.balanceOf(user.address)).equals(50000000000000);
      });
    });

    describe('Events', () => {
      it('Should emit an event on cancelMintRequest', async () => {
        const { gCLPRequestToken, user, id2 } = await loadFixture(scenario);
        await gCLPRequestToken.connect(user).addRequest(RequestType.MINT, 100000000000000, id2);

        await expect(gCLPRequestToken.connect(user).cancelRequest(RequestType.MINT, id2)).to.emit(
          gCLPRequestToken,
          'RequestCancelled',
        );
      });
    });
  });
});

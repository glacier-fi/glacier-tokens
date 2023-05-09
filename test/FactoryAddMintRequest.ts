import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, RequestType } from './global';

describe('Factory', () => {
  describe('AddMintRequest', () => {
    describe('Validations', () => {
      it('Should revert with a factory without token access', async () => {
        const { gUSDTFactory, minter, id0 } = await loadFixture(scenario);
        const amount = 100000000000000;

        await expect(gUSDTFactory.connect(minter).addRequest(RequestType.MINT, amount, id0)).to.be.revertedWith(
          Errors.UNAUTHORIZED_TOKEN_ACCESS,
        );
      });

      it('Should revert with a non user', async () => {
        const { gCLPFactory, user1, id0 } = await loadFixture(scenario);
        const amount = 100000000000000;

        await expect(gCLPFactory.connect(user1).addRequest(RequestType.MINT, amount, id0)).to.be.revertedWith(
          Errors.UNAUTHORIZED,
        );
      });

      it('Should revert with a duplicated id', async () => {
        const { gCLPFactory, minter, id0 } = await loadFixture(scenario);
        const amount = 200000000000000;

        await expect(gCLPFactory.connect(minter).addRequest(RequestType.MINT, amount, id0)).to.be.revertedWith(
          Errors.REQUEST_ALREADY_EXISTS,
        );
      });

      it('Should revert with amount equals to zero', async () => {
        const { gCLPFactory, minter, id1 } = await loadFixture(scenario);
        const amount = 0;

        await expect(gCLPFactory.connect(minter).addRequest(RequestType.MINT, amount, id1)).to.be.revertedWith(
          Errors.INVALID_AMOUNT,
        );
      });

      it('Should revert with request type that does not exists', async () => {
        const { gCLPFactory, minter, id2 } = await loadFixture(scenario);
        const amount = 100000000000000;

        await expect(gCLPFactory.connect(minter).addRequest(RequestType.NOT_EXISTS, amount, id2)).to.be.reverted;
      });

      it('Should Not fail with amount greater than zero', async () => {
        const { gCLPFactory, minter, id2 } = await loadFixture(scenario);
        const amount = 100000000000000;

        await expect(gCLPFactory.connect(minter).addRequest(RequestType.MINT, amount, id2)).not.to.be.reverted;
      });
    });

    describe('Events', () => {
      it('Should emit an event on addMintRequest', async () => {
        const { gCLPFactory, minter, id2 } = await loadFixture(scenario);
        const amount = 100000000000000;

        await expect(gCLPFactory.connect(minter).addRequest(RequestType.MINT, amount, id2)).to.emit(
          gCLPFactory,
          'RequestAdded',
        );
      });
    });
  });
});

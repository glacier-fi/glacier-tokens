import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, RequestType } from './global';

describe('Factory', () => {
  describe('AddBurnRequest', () => {
    describe('Validations', () => {
      it('Should revert with a non burner', async () => {
        const { gCLPFactory, user1, id0 } = await loadFixture(scenario);
        const amount = 100000000000000;

        await expect(gCLPFactory.connect(user1).addRequest(RequestType.BURN, amount, id0)).to.be.revertedWith(
          Errors.UNAUTHORIZED,
        );
      });

      it('Should revert with a duplicated id', async () => {
        const { gCLPFactory, user, id0 } = await loadFixture(scenario);
        const amount = 500000000000000;

        await expect(gCLPFactory.connect(user).addRequest(RequestType.BURN, amount, id0)).to.be.revertedWith(
          Errors.REQUEST_ALREADY_EXISTS,
        );
      });

      it('Should revert if amount is greater than actual balance', async () => {
        const { gCLPFactory, user, id2 } = await loadFixture(scenario);
        const amount = 600000000000000;

        await expect(gCLPFactory.connect(user).addRequest(RequestType.BURN, amount, id2)).to.be.revertedWith(
          Errors.NOT_ENOUGH_AVAILABLE_USER_BALANCE,
        );
      });

      it('Should revert with amount equals to zero', async () => {
        const { gCLPFactory, user, id1 } = await loadFixture(scenario);
        const amount = 0;

        await expect(gCLPFactory.connect(user).addRequest(RequestType.BURN, amount, id1)).to.be.revertedWith(
          Errors.INVALID_AMOUNT,
        );
      });

      it('Should Not fail with amount greater than zero', async () => {
        const { gCLPFactory, user, id2, gCLP } = await loadFixture(scenario);
        const amount = 50000000000000;

        expect(await gCLP.balanceOf(user.address)).equals(50000000000000);

        await expect(gCLPFactory.connect(user).addRequest(RequestType.BURN, amount, id2)).not.to.be.reverted;

        expect(await gCLP.balanceOf(user.address)).equals(0);
        expect(await gCLP.balanceOf(gCLPFactory.address)).equals(100000000000000);
      });
    });

    describe('Events', () => {
      it('Should emit an event on addBurnRequest', async () => {
        const { gCLPFactory, user, id2 } = await loadFixture(scenario);
        const amount = 50000000000000;

        await expect(gCLPFactory.connect(user).addRequest(RequestType.BURN, amount, id2)).to.emit(
          gCLPFactory,
          'RequestAdded',
        );
      });
    });
  });
});

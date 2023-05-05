import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, ids } from './global';

describe('Factory', () => {
  describe('CancelBurnRequest', () => {
    describe('Validations', () => {
      it('Should revert with a non burner', async () => {
        const { id0 } = ids();
        const { gCLPFactory, minter } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(minter).cancelBurnRequest(id0)).to.be.revertedWith(Errors.UNAUTHORIZED);
      });

      it('Should revert with id that does not exists', async () => {
        const { id2 } = ids();
        const { gCLPFactory, burner } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(burner).cancelBurnRequest(id2)).to.be.revertedWith(Errors.NOT_FOUND);
      });

      it('Should revert with sender not equal requester', async () => {
        const { id0 } = ids();
        const { gCLPFactory, burner } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(burner).cancelBurnRequest(id0)).to.be.revertedWith(
          Errors.SENDER_NOT_EQUAL_REQUESTER,
        );
      });

      it('Should revert if request is not pending', async () => {
        const { id0 } = ids();
        const { gCLPFactory, user } = await loadFixture(scenario);

        await gCLPFactory.connect(user).cancelBurnRequest(id0);

        // await expect(gCLPFactory.connect(user).cancelBurnRequest(id0)).to.be.revertedWith(Errors.REQUEST_NOT_PENDING);
      });

      // it('Should Not fail with a pending request', async () => {
      //   const { id0 } = ids();
      //   const { gCLPFactory, user, gCLP } = await loadFixture(scenario);
      //   expect(await gCLP.balanceOf(user.address)).to.be.equals(50000000000000);
      //   expect(await gCLPFactory.connect(user).cancelBurnRequest(id0)).not.to.be.reverted;
      //   expect(await gCLP.balanceOf(user.address)).to.be.equals(100000000000000);
      // });
    });

    describe('Events', () => {
      it('Should emit an event on cancelBurnRequest', async () => {
        const { id0 } = ids();
        const { gCLPFactory, user } = await loadFixture(scenario);

        await expect(gCLPFactory.connect(user).cancelBurnRequest(id0)).to.emit(gCLPFactory, 'BurnRequestCancelled');
      });
    });
  });
});

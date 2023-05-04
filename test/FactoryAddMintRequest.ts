import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, ids } from './global';

describe('Factory', () => {
  describe('AddMintRequest', () => {
    describe('Validations', () => {
      it('Should revert with a non minter', async () => {
        const { id0 } = ids();
        const { gCLPFactory, burner } = await loadFixture(scenario);
        const amount = 100000000000000;

        expect(gCLPFactory.connect(burner).addMintRequest(amount, id0)).to.be.revertedWith(Errors.UNAUTHORIZED);
      });

      it('Should revert with a duplicated id', async () => {
        const { id0 } = ids();
        const { gCLPFactory, minter } = await loadFixture(scenario);
        const amount = 200000000000000;

        expect(gCLPFactory.connect(minter).addMintRequest(amount, id0)).to.be.revertedWith(
          Errors.REQUEST_ALREADY_EXISTS,
        );
      });

      it('Should revert with amount equals to zero', async () => {
        const { id1 } = ids();
        const { gCLPFactory, minter } = await loadFixture(scenario);
        const amount = 0;

        expect(gCLPFactory.connect(minter).addMintRequest(amount, id1)).to.be.revertedWith(Errors.INVALID_AMOUNT);
      });

      it('Should Not fail with amount greater than zero', async () => {
        const { id1 } = ids();
        const { gCLPFactory, minter } = await loadFixture(scenario);

        expect(gCLPFactory.connect(minter).addMintRequest(100000000000000, id1)).not.to.be.reverted;
      });
    });

    describe('Events', () => {
      it('Should emit an event on addMintRequest', async () => {
        const { id1 } = ids();
        const { gCLPFactory, minter } = await loadFixture(scenario);
        const amount = 100000000000000;

        await expect(gCLPFactory.connect(minter).addMintRequest(amount, id1)).to.emit(gCLPFactory, 'MintRequestAdded');
      });
    });
  });
});

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, factoryDeployScenario, ids } from './global';

describe('Factory', () => {
  describe('ConfirmMintRequest', function () {
    describe('Validations', function () {
      it('Should revert with a non confirmer', async function () {
        const { id0 } = ids();
        const { factory, burner } = await loadFixture(factoryDeployScenario);

        await expect(factory.connect(burner).confirmMintRequest(id0)).to.be.revertedWith(Errors.UNAUTHORIZED);
      });
    });
  });
});

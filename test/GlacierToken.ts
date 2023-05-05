import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('GlacierToken', () => {
  describe('Constructor', () => {
    it('Should create an instance of the GlacierToken', async () => {
      const name = 'Glacier CLP';
      const symbol = 'GCLP';
      const decimals = 8;

      const GlacierToken = await ethers.getContractFactory('GlacierToken');
      const gCLP = await GlacierToken.deploy(name, symbol, decimals);

      expect(await gCLP.name()).to.equal(name);
      expect(await gCLP.symbol()).to.equal(symbol);
      expect(await gCLP.decimals()).to.equal(decimals);
    });
  });
});

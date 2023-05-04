import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('FactoryRegistry', () => {
  async function deploy() {
    const GlacierToken = await ethers.getContractFactory('GlacierToken');
    const glacierToken = await GlacierToken.deploy('gCLP', 'gCLP', 8);

    const Factory = await ethers.getContractFactory('Factory');
    const factory = await Factory.deploy(glacierToken.address);

    const FactoryRegistry = await ethers.getContractFactory('FactoryRegistry');
    const factoryRegistry = await FactoryRegistry.deploy();

    return { factoryRegistry, factory };
  }

  describe('Events', function () {
    it('Should emit an event on registerFactory', async function () {
      const { factoryRegistry, factory } = await loadFixture(deploy);

      await expect(factoryRegistry.registerFactory(factory.address, 1)).to.emit(factoryRegistry, 'FactoryRegistered');
    });

    it('Should emit an event on unregisterFactory', async function () {
      const { factoryRegistry, factory } = await loadFixture(deploy);
      factoryRegistry.registerFactory(factory.address, 1);

      await expect(factoryRegistry.unregisterFactory(factory.address))
        .to.emit(factoryRegistry, 'FactoryUnregistered')
        .withArgs(factory.address);
    });
  });
});

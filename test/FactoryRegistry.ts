import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, ZERO_ADDRESS } from './global';

describe('FactoryRegistry', () => {
  describe('Validations', () => {
    it('Should return 1 factories', async () => {
      const { factoryRegistry, gCLPFactory } = await loadFixture(scenario);

      factoryRegistry.registerFactory(gCLPFactory.address);
      factoryRegistry.unregisterFactory(gCLPFactory.address);
      factoryRegistry.registerFactory(gCLPFactory.address);

      expect((await factoryRegistry.getFactoriesList()).length).to.be.equal(1);
    });

    it('Should return 0 factories', async () => {
      const { factoryRegistry, gCLPFactory } = await loadFixture(scenario);

      factoryRegistry.registerFactory(gCLPFactory.address);
      factoryRegistry.registerFactory(gCLPFactory.address);
      factoryRegistry.unregisterFactory(gCLPFactory.address);

      expect((await factoryRegistry.getFactoriesList()).length).to.be.equal(0);
    });

    it('Should fail with a non factory address on registerFactory', async () => {
      const { factoryRegistry, minter } = await loadFixture(scenario);
      expect(factoryRegistry.registerFactory(minter.address)).to.be.reverted;
    });

    it('Should fail with a non factory address on unregisterFactory', async () => {
      const { factoryRegistry, minter } = await loadFixture(scenario);
      expect(factoryRegistry.unregisterFactory(minter.address)).to.be.reverted;
    });

    it('Should fail with id 0', async () => {
      const { factoryRegistry } = await loadFixture(scenario);

      expect(factoryRegistry.registerFactory(ZERO_ADDRESS)).to.be.revertedWith(Errors.INVALID_ADDRESS);
    });

    it('Should fail with unknow factory', async () => {
      const { factoryRegistry, gCLPFactory } = await loadFixture(scenario);

      expect(factoryRegistry.unregisterFactory(gCLPFactory.address)).to.be.revertedWith(Errors.NOT_FOUND);
    });

    it('Should fail with if caller is not owner on unregisterFactory', async () => {
      const { factoryRegistry, gCLPFactory, minter } = await loadFixture(scenario);

      expect(factoryRegistry.connect(minter).unregisterFactory(gCLPFactory.address)).to.be.reverted;
    });

    it('Should fail with if caller is not owner on registerFactory', async () => {
      const { factoryRegistry, gCLPFactory, minter } = await loadFixture(scenario);

      expect(factoryRegistry.connect(minter).registerFactory(gCLPFactory.address)).to.be.reverted;
    });
  });

  describe('Events', function () {
    it('Should emit an event on registerFactory', async function () {
      const { factoryRegistry, gCLPFactory } = await loadFixture(scenario);

      expect(factoryRegistry.registerFactory(gCLPFactory.address)).to.emit(factoryRegistry, 'FactoryRegistered');
    });

    it('Should emit an event on unregisterFactory', async function () {
      const { factoryRegistry, gCLPFactory } = await loadFixture(scenario);
      await factoryRegistry.registerFactory(gCLPFactory.address);

      expect(factoryRegistry.unregisterFactory(gCLPFactory.address)).to.emit(factoryRegistry, 'FactoryUnregistered');
    });
  });
});

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Errors, scenario, ZERO_ADDRESS } from './global';

describe('RequestTokenRegistry', () => {
  describe('Validations', () => {
    it('Should return 1 factories', async () => {
      const { requestTokenRegistry, gCLPRequestToken } = await loadFixture(scenario);

      await requestTokenRegistry.unregister(gCLPRequestToken.address);
      await requestTokenRegistry.register(gCLPRequestToken.address);

      expect((await requestTokenRegistry.getRequestTokenList()).length).to.be.equal(1);
    });

    it('Should return 0 factories', async () => {
      const { requestTokenRegistry, gCLPRequestToken } = await loadFixture(scenario);

      await requestTokenRegistry.unregister(gCLPRequestToken.address);

      expect((await requestTokenRegistry.getRequestTokenList()).length).to.be.equal(0);
    });

    it('Should fail with a non factory address on registerFactory', async () => {
      const { requestTokenRegistry, minter } = await loadFixture(scenario);
      await expect(requestTokenRegistry.register(minter.address)).to.be.reverted;
    });

    it('Should fail with address 0x0', async () => {
      const { requestTokenRegistry } = await loadFixture(scenario);

      await expect(requestTokenRegistry.register(ZERO_ADDRESS)).to.be.revertedWith(Errors.INVALID_ADDRESS);
    });

    it('Should fail with unknow factory', async () => {
      const { requestTokenRegistry, minter } = await loadFixture(scenario);

      await expect(requestTokenRegistry.unregister(minter.address)).to.be.revertedWith(Errors.NOT_FOUND);
    });

    it('Should fail with if caller is not owner on unregisterFactory', async () => {
      const { requestTokenRegistry, gCLPRequestToken, minter } = await loadFixture(scenario);

      await expect(requestTokenRegistry.connect(minter).unregister(gCLPRequestToken.address)).to.be.reverted;
    });

    it('Should fail with if caller is not owner on registerFactory', async () => {
      const { requestTokenRegistry, gCLPRequestToken, minter } = await loadFixture(scenario);

      await expect(requestTokenRegistry.connect(minter).register(gCLPRequestToken.address)).to.be.reverted;
    });

    it('Should fail if factory does not have default admin role', async () => {
      const { requestTokenRegistry, gCLP } = await loadFixture(scenario);

      await expect(requestTokenRegistry.createRequestToken(gCLP.address)).to.be.revertedWith(
        Errors.UNAUTHORIZED_TOKEN_ACCESS,
      );
    });

    it('Should fail with address 0x0', async () => {
      const { requestTokenRegistry } = await loadFixture(scenario);

      await expect(requestTokenRegistry.createRequestToken(ZERO_ADDRESS)).to.be.revertedWith(Errors.INVALID_ADDRESS);
    });

    it('Should Not fail factory has default admin role', async () => {
      const { requestTokenRegistry, gCLP } = await loadFixture(scenario);
      await gCLP.grantRole(gCLP.DEFAULT_ADMIN_ROLE(), requestTokenRegistry.address);

      await expect(requestTokenRegistry.createRequestToken(gCLP.address)).not.be.reverted;
      expect((await requestTokenRegistry.getRequestTokenList()).length).to.be.equal(2);
    });
  });

  describe('Events', function () {
    it('Should emit an event on register', async function () {
      const { requestTokenRegistry, gCLPRequestToken } = await loadFixture(scenario);
      await requestTokenRegistry.unregister(gCLPRequestToken.address);

      await expect(requestTokenRegistry.register(gCLPRequestToken.address)).to.emit(requestTokenRegistry, 'Registered');
    });

    it('Should not emit an event on register', async function () {
      const { requestTokenRegistry, gCLPRequestToken } = await loadFixture(scenario);

      await expect(requestTokenRegistry.register(gCLPRequestToken.address)).to.not.emit(
        requestTokenRegistry,
        'Registered',
      );
    });
    it('Should emit an event on unregister', async function () {
      const { requestTokenRegistry, gCLPRequestToken } = await loadFixture(scenario);

      await expect(requestTokenRegistry.unregister(gCLPRequestToken.address)).to.emit(
        requestTokenRegistry,
        'Unregistered',
      );
    });
  });
});

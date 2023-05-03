import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Factory', () => {
  async function deploy() {
    const [_, user1, user2, user3] = await ethers.getSigners();

    const GlacierToken = await ethers.getContractFactory('GlacierToken');
    const glacierToken = await GlacierToken.deploy('gCLP', 'gCLP', 8);

    const Factory = await ethers.getContractFactory('Factory');
    const factory = await Factory.deploy(glacierToken.address);

    await factory.grantRole(factory.MINTER_ROLE(), user1.getAddress());
    await factory.grantRole(factory.BURNER_ROLE(), user2.getAddress());
    await factory.addMintRequest(100000000000000, '426fd646-c27b-44ad-b48c-6cdd707c5f03');

    return { factory, user1, user2, user3 };
  }

  describe('AddMintRequest', function () {
    describe('Validations', function () {
      it('Should revert with a non minter', async function () {
        const { factory, user2 } = await loadFixture(deploy);

        await expect(
          factory.connect(user2).addMintRequest(100000000000000, '426fd646-c27b-44ad-b48c-6cdd707c5f03'),
        ).to.be.revertedWith('1');
      });

      it('Should revert with a duplicated txId', async function () {
        const { factory, user1 } = await loadFixture(deploy);

        await expect(
          factory.connect(user1).addMintRequest(200000000000000, '426fd646-c27b-44ad-b48c-6cdd707c5f03'),
        ).to.be.revertedWith('5');
      });

      it('Should revert with amount equals to zero', async function () {
        const { factory, user1 } = await loadFixture(deploy);

        await expect(
          factory.connect(user1).addMintRequest(0, '65f7b547-a87b-4631-a767-e0655a97c705'),
        ).to.be.revertedWith('6');
      });

      it('Should Not fail with amount greater than zero', async function () {
        const { factory, user1 } = await loadFixture(deploy);
        const txId = '65f7b547-a87b-4631-a767-e0655a97c705';
        await expect(factory.connect(user1).addMintRequest(100000000000000, txId)).not.to.be.reverted;
      });
    });

    describe('Events', function () {
      it('Should emit an event on addMintRequest', async function () {
        const { factory, user1 } = await loadFixture(deploy);
        const txId = '65f7b547-a87b-4631-a767-e0655a97c705';

        await expect(factory.connect(user1).addMintRequest(100000000000000, txId)).to.emit(factory, 'MintRequestAdded');
      });
    });
  });
});

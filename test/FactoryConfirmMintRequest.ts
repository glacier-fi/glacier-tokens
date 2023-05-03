import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Factory', () => {
  async function deploy() {
    const [user0, user1, user2, user3] = await ethers.getSigners();

    const GlacierToken = await ethers.getContractFactory('GlacierToken');
    const glacierToken = await GlacierToken.deploy('gCLP', 'gCLP', 8);

    const Factory = await ethers.getContractFactory('Factory');
    const factory = await Factory.deploy(glacierToken.address);

    await factory.grantRole(factory.MINTER_ROLE(), user1.getAddress());
    await factory.grantRole(factory.BURNER_ROLE(), user2.getAddress());
    await factory.grantRole(factory.CONFIRMER_ROLE(), user3.getAddress());

    await factory.addMintRequest(100000000000000, '426fd646-c27b-44ad-b48c-6cdd707c5f03');

    return { factory, user0, user1, user2, user3 };
  }

  describe('CancelMintRequest', function () {
    describe('Validations', function () {
      it('Should revert with a non minter', async function () {
        const { factory, user2 } = await loadFixture(deploy);

        await expect(
          factory.connect(user2).cancelMintRequest('426fd646-c27b-44ad-b48c-6cdd707c5f03'),
        ).to.be.revertedWith('1');
      });

      it('Should revert with txId that does not exists', async function () {
        const { factory, user1 } = await loadFixture(deploy);

        await expect(
          factory.connect(user1).cancelMintRequest('00000000-c27b-44ad-b48c-6cdd707c5f03'),
        ).to.be.revertedWith('2');
      });

      it('Should revert with sender not equal requester', async function () {
        const { factory, user1 } = await loadFixture(deploy);

        await expect(
          factory.connect(user1).cancelMintRequest('426fd646-c27b-44ad-b48c-6cdd707c5f03'),
        ).to.be.revertedWith('3');
      });

      it('Should revert if request is not pending', async function () {
        const { factory, user0 } = await loadFixture(deploy);
        const txId = '426fd646-c27b-44ad-b48c-6cdd707c5f03';

        await factory.connect(user0).cancelMintRequest(txId);

        await expect(factory.connect(user0).cancelMintRequest(txId)).to.be.revertedWith('4');
      });

      it('Should Not fail with a pending request', async function () {
        const { factory, user0 } = await loadFixture(deploy);
        const txId = '426fd646-c27b-44ad-b48c-6cdd707c5f03';

        await expect(factory.connect(user0).cancelMintRequest(txId)).not.to.be.reverted;
      });
    });

    describe('Events', function () {
      it('Should emit an event on cancelMintRequest', async function () {
        const { factory, user0 } = await loadFixture(deploy);

        await expect(factory.connect(user0).cancelMintRequest('426fd646-c27b-44ad-b48c-6cdd707c5f03')).to.emit(
          factory,
          'MintRequestCancelled',
        );
      });
    });
  });
});

import { ethers } from 'hardhat';

export enum Errors {
  INVALID_ADDRESS = '0',
  UNAUTHORIZED = '1',
  NOT_FOUND = '2',
  SENDER_NOT_EQUAL_REQUESTER = '3',
  REQUEST_NOT_PENDING = '4',
  REQUEST_ALREADY_EXISTS = '5',
  INVALID_AMOUNT = '6',
}

export const ids = () => {
  const id0 = '426fd646-c27b-44ad-b48c-6cdd707c5f03';
  const id1 = '65f7b547-a87b-4631-a767-e0655a97c705';
  const id2 = '1e11b345-c233-1234-c637-h723g12e889';
  return { id0, id1, id2 };
};

export const factoryDeployScenario = async () => {
  const [admin, minter, burner, confirmer] = await ethers.getSigners();

  const GlacierToken = await ethers.getContractFactory('GlacierToken');
  const glacierToken = await GlacierToken.deploy('gCLP', 'gCLP', 8);

  const Factory = await ethers.getContractFactory('Factory');
  const factory = await Factory.deploy(glacierToken.address);

  await factory.grantRole(factory.MINTER_ROLE(), minter.getAddress());
  await factory.grantRole(factory.BURNER_ROLE(), burner.getAddress());
  await factory.grantRole(factory.BURNER_ROLE(), confirmer.getAddress());
  await factory.addMintRequest(100000000000000, '426fd646-c27b-44ad-b48c-6cdd707c5f03');

  return { factory, admin, minter, burner, confirmer };
};

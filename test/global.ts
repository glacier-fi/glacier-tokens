import { ethers } from 'hardhat';

export enum Errors {
  INVALID_ADDRESS = '0',
  UNAUTHORIZED = '1',
  NOT_FOUND = '2',
  SENDER_NOT_EQUAL_REQUESTER = '3',
  REQUEST_NOT_PENDING = '4',
  REQUEST_ALREADY_EXISTS = '5',
  INVALID_AMOUNT = '6',
  UNAUTHORIZED_TOKEN_ACCESS = '7',
  NOT_ENOUGH_AVAILABLE_USER_BALANCE = '8',
}

export const RequestType = {
  BURN: 0,
  MINT: 1,
};
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const MAX_UINT_AMOUNT = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

export const ids = () => {
  const id0 = '426fd646-c27b-44ad-b48c-6cdd707c5f03';
  const id1 = '65f7b547-a87b-4631-a767-e0655a97c705';
  const id2 = '1e11b345-c233-1234-c637-h723g12e889';
  return { id0, id1, id2 };
};

export const scenario = async () => {
  const [admin, minter, burner, confirmer, user] = await ethers.getSigners();
  const { id0 } = ids();

  const GlacierToken = await ethers.getContractFactory('GlacierToken');
  const gCLP = await GlacierToken.deploy('Glacier CLP', 'GCLP', 8);
  const gUSDT = await GlacierToken.deploy('Glacier USDT', 'USDT', 8);

  const Factory = await ethers.getContractFactory('Factory');
  const gCLPFactory = await Factory.deploy(gCLP.address);
  const gUSDTFactory = await Factory.deploy(gUSDT.address);

  const FactoryRegistry = await ethers.getContractFactory('FactoryRegistry');
  const factoryRegistry = await FactoryRegistry.deploy();

  await gCLP.grantRole(gCLP.MINTER_ROLE(), gCLPFactory.address);
  await gCLP.connect(user).approve(gCLPFactory.address, MAX_UINT_AMOUNT);

  await gCLPFactory.grantRole(gCLPFactory.MINTER_ROLE(), minter.getAddress());
  await gCLPFactory.grantRole(gCLPFactory.BURNER_ROLE(), burner.getAddress());
  await gCLPFactory.grantRole(gCLPFactory.MINTER_ROLE(), user.getAddress());
  await gCLPFactory.grantRole(gCLPFactory.BURNER_ROLE(), user.getAddress());
  await gCLPFactory.grantRole(gCLPFactory.CONFIRMER_ROLE(), confirmer.getAddress());

  await gCLPFactory.connect(user).addMintRequest(100000000000000, id0);
  await gCLPFactory.connect(confirmer).confirmMintRequest(id0);
  await gCLPFactory.connect(user).addBurnRequest(50000000000000, id0);

  await gUSDTFactory.grantRole(gUSDTFactory.MINTER_ROLE(), minter.getAddress());
  //await gCLPFactory.connect(user).addBurnRequest(100000000000000, id0);

  //await gUSDTFactory.connect(user).addMintRequest(100000000000000, id0);
  // await gUSDTFactory.connect(confirmer).confirmMintRequest(id0);

  return { factoryRegistry, gCLP, gUSDT, gCLPFactory, gUSDTFactory, admin, minter, burner, confirmer, user };
};

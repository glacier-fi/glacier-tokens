import { v4 as uuidv4 } from 'uuid';
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
  SENDER_REQUEST_TYPE_NOT_EQUAL_REQUESTER_REQUEST_TYPE = '9',
}

export const RequestType = {
  BURN: 0,
  MINT: 1,
  NOT_EXISTS: 2,
};

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const MAX_UINT_AMOUNT = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

const ids = () => {
  const id0 = uuidv4();
  const id1 = uuidv4();
  const id2 = uuidv4();

  return { id0, id1, id2 };
};

export const scenario = async () => {
  const [admin, minter, burner, confirmer, user, user1] = await ethers.getSigners();
  const { id0, id1, id2 } = ids();

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

  await gCLPFactory.grantRole(gCLPFactory.USER_ROLE(), minter.getAddress());
  await gCLPFactory.grantRole(gCLPFactory.USER_ROLE(), burner.getAddress());
  await gCLPFactory.grantRole(gCLPFactory.USER_ROLE(), user.getAddress());
  await gCLPFactory.grantRole(gCLPFactory.CONFIRMER_ROLE(), confirmer.getAddress());

  await gCLPFactory.connect(user).addRequest(RequestType.MINT, 100000000000000, id0);
  await gCLPFactory.connect(confirmer).confirmRequest(RequestType.MINT, id0);
  await gCLPFactory.connect(user).addRequest(RequestType.BURN, 50000000000000, id1);

  await gUSDTFactory.grantRole(gUSDTFactory.USER_ROLE(), minter.getAddress());
  //await gCLPFactory.connect(user).addBurnRequest(100000000000000, id0);

  //await gUSDTFactory.connect(user).addMintRequest(100000000000000, id0);
  // await gUSDTFactory.connect(confirmer).confirmMintRequest(id0);

  return {
    factoryRegistry,
    gCLP,
    gUSDT,
    gCLPFactory,
    gUSDTFactory,
    admin,
    minter,
    burner,
    confirmer,
    user,
    user1,
    id0,
    id1,
    id2,
  };
};

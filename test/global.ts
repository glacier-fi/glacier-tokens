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
  const [deployer, minter, burner, confirmer, user, user1] = await ethers.getSigners();
  const { id0, id1, id2 } = ids();
  const GlacierToken = await ethers.getContractFactory('GlacierToken');
  const gCLP = await GlacierToken.connect(deployer).deploy('Glacier CLP', 'GCLP', 8);

  const RequestTokenRegistry = await ethers.getContractFactory('RequestTokenRegistry');
  const requestTokenRegistry = await RequestTokenRegistry.connect(deployer).deploy();

  await gCLP.grantRole(gCLP.DEFAULT_ADMIN_ROLE(), requestTokenRegistry.address);
  await requestTokenRegistry.connect(deployer).createRequestToken(gCLP.address);
  await gCLP.revokeRole(gCLP.DEFAULT_ADMIN_ROLE(), requestTokenRegistry.address);

  const requestTokenAdrress = (await requestTokenRegistry.getRequestTokenList())[0];

  const RequestToken = await ethers.getContractFactory('RequestToken');
  const gCLPRequestToken = RequestToken.connect(deployer).attach(requestTokenAdrress);

  await gCLP.connect(user).approve(gCLPRequestToken.address, MAX_UINT_AMOUNT);

  await gCLPRequestToken.grantRole(gCLPRequestToken.USER_ROLE(), minter.getAddress());
  await gCLPRequestToken.grantRole(gCLPRequestToken.USER_ROLE(), burner.getAddress());
  await gCLPRequestToken.grantRole(gCLPRequestToken.USER_ROLE(), user.getAddress());
  await gCLPRequestToken.grantRole(gCLPRequestToken.CONFIRMER_ROLE(), confirmer.getAddress());

  await gCLPRequestToken.connect(user).addRequest(RequestType.MINT, 100000000000000, id0);
  await gCLPRequestToken.connect(confirmer).confirmRequest(RequestType.MINT, id0);
  await gCLPRequestToken.connect(user).addRequest(RequestType.BURN, 50000000000000, id1);

  return {
    requestTokenRegistry,
    gCLP,
    gCLPRequestToken,
    deployer,
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

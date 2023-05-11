import { task } from 'hardhat/config';
import { ContractTransaction, ContractFactory, Signer, ethers } from 'ethers';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

enum GlacierToken {
  GCLP,
  GETH,
  GUSDT,
  GGLMR,
}

type TokenDeploy = {
  networkName: string;
  tokenName: string;
  token: ContractFactory;
  deployer: Signer;
};

const getDb = (networkName: string) => low(new FileSync(`./deployed-contracts-${networkName}.json`));

const waitForTx = async (tx: ContractTransaction) => {
  console.log('pending tx:', tx.hash, '\n');
  return await tx.wait(1);
};

const tokenDeploy = async (td: TokenDeploy): Promise<string> => {
  const db = getDb(td.networkName);

  let tokenName = td.tokenName;
  let tokenAddress;
  let factoryAddress;

  if (db.get(`${td.tokenName}`).isEmpty().value()) {
    const token = await td.token.connect(td.deployer).deploy();
    console.log(`\nDeploying Token ${tokenName}...`);
    await waitForTx(token.deployTransaction);
    tokenAddress = token.address;

    db.set(`${td.tokenName}`, {
      address: tokenAddress,
      factory: factoryAddress,
      deployer: token.deployTransaction.from,
    }).write();
  } else {
    tokenAddress = db.get(`${td.tokenName}`).value().address;
    tokenName = `${td.tokenName} already`;
  }

  console.log(`\n${tokenName} Deployed!`);
  console.log(`Token Address: ${tokenAddress}`);

  return tokenAddress;
};

task('deploy:token', 'Deploy Glacier token')
  .addParam('tokenName', 'Contract Factory')
  .setAction(async (options, HRE) => {
    const networkName = HRE.network.name;
    const ethers = HRE.ethers;
    const tknName = String(options.tokenName);
    const deployer = (await ethers.getSigners())[0];
    const Token = await ethers.getContractFactory(String(options.tokenName));

    const tkn: TokenDeploy = {
      networkName: networkName,
      tokenName: tknName,
      token: Token,
      deployer: deployer,
    };

    await tokenDeploy(tkn);
  });

task('deploy', 'Deploy Glacier tokens contracts').setAction(async (_, HRE) => {
  const networkName = HRE.network.name;
  const ethers = HRE.ethers;
  const deployer = (await ethers.getSigners())[0];
  const RequestToken = await ethers.getContractFactory('RequestToken');
  const RequestTokenRegistry = await ethers.getContractFactory('RequestTokenRegistry');

  console.log(`Network: ${networkName}`);
  console.log(`Deployer: ${deployer.address}`);

  let requestToken;
  let requestTokenRegistry;
  let requestTokenRegistryAddress;
  let requestTokenRegistryMsg;

  if (getDb(networkName).get('requestTokenRegistry').isEmpty().value()) {
    requestToken = await RequestToken.connect(deployer).deploy();

    console.log(`\nDeploying RequestToken...`);
    await waitForTx(requestToken.deployTransaction);

    requestTokenRegistry = await RequestTokenRegistry.connect(deployer).deploy(requestToken.address);

    console.log(`\nDeploying RequestTokenRegistry...`);
    await waitForTx(requestTokenRegistry.deployTransaction);

    getDb(networkName)
      .set('requestTokenRegistry', {
        address: requestTokenRegistry.address,
        deployer: requestTokenRegistry.deployTransaction.from,
      })
      .write();

    requestTokenRegistryAddress = requestTokenRegistry.address;
    requestTokenRegistryMsg = 'RequestTokenRegistry';
  } else {
    requestTokenRegistryAddress = getDb(networkName).get('requestTokenRegistry').value().address;
    requestTokenRegistryMsg = 'RequestTokenRegistry already';
    requestTokenRegistry = RequestTokenRegistry.connect(deployer).attach(requestTokenRegistryAddress);
  }

  console.log(`\n${requestTokenRegistryMsg} Deployed!`);
  console.log(`RequestTokenRegistry Address: ${requestTokenRegistryAddress}`);

  const gTokens = Object.keys(GlacierToken).filter(v => isNaN(Number(v)));

  for (let i = 0; i < gTokens.length; i++) {
    let gToken = gTokens[i];

    let tkn: TokenDeploy = {
      networkName: networkName,
      tokenName: gToken,
      token: await ethers.getContractFactory(gToken),
      deployer: deployer,
    };

    const tokenAddress = await tokenDeploy(tkn);
    const Token = await ethers.getContractFactory('GlacierToken');
    const token = Token.connect(deployer).attach(tokenAddress);

    let tx = await token.grantRole(token.DEFAULT_ADMIN_ROLE(), requestTokenRegistryAddress);
    await waitForTx(tx);

    tx = await requestTokenRegistry.createRequestToken(tokenAddress);
    console.log(`\nCreating RequestToken for ${gToken}`);
    await waitForTx(tx);

    tx = await token.revokeRole(token.DEFAULT_ADMIN_ROLE(), requestTokenRegistryAddress);
    await waitForTx(tx);
  }

  const requestTokens = await requestTokenRegistry.getRequestTokenList();
  const ERC20PresetMinterPauser = await ethers.getContractFactory('ERC20PresetMinterPauser');

  for (let i = 0; i < requestTokens.length; i++) {
    requestToken = RequestToken.connect(deployer).attach(requestTokens[i]);
    const token = ERC20PresetMinterPauser.connect(deployer).attach(await requestToken.token());
    const symbol = await token.symbol();

    const savedToken = getDb(networkName).get(`${symbol}`).value();
    getDb(networkName)
      .set(`${symbol}`, { ...savedToken, ...{ requestToken: requestTokens[i] } })
      .write();
  }
});

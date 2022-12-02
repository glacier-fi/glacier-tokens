import { task } from "hardhat/config"
import { ContractTransaction, ContractFactory, Signer, ethers } from 'ethers';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

enum GlacierToken {
  GCLP,
  GETH,
  GUSDT,
  GGLMR
}

type TokenDeploy = {
  networkName: string
  tokenName: string
  token: ContractFactory
  factory: ContractFactory
  deployer: Signer
}

const getDb = (networkName: string) => low(new FileSync(`./deployed-contracts-${networkName}.json`));

const waitForTx = async (tx: ContractTransaction) => {
  console.log("pending tx:", tx.hash, "\n")
  return await tx.wait(1);
}

const tokenDeploy = async (td: TokenDeploy) => {
  const db = getDb(td.networkName)

  let tokenName = td.tokenName;
  let tokenAddress;
  let factoryAddress;

  if (db.get(`${td.tokenName}`).isEmpty().value()) {
    const token = await td.token.connect(td.deployer).deploy();
    console.log(`\nDeploying Token ${tokenName}...`);
    await waitForTx(token.deployTransaction);

    const factory = await td.factory.connect(td.deployer).deploy(token.address)
    console.log(`\nDeploying Factory ${tokenName}...`);
    await waitForTx(factory.deployTransaction);

    tokenAddress = token.address
    factoryAddress = factory.address

    db.set(`${td.tokenName}`, {
      address: tokenAddress,
      factory: factoryAddress,
      deployer: token.deployTransaction.from,
    }).write();

  } else {
    tokenAddress = db.get(`${td.tokenName}`).value().address;
    factoryAddress = db.get(`${td.tokenName}`).value().factory;
    tokenName = `${td.tokenName} already`;
  }

  console.log(`\n${tokenName} Deployed!`);
  console.log(`Token Address: ${tokenAddress}`);
  console.log(`Factory Address: ${factoryAddress}`);
}

task("deploy:token", "Deploy Glacier token")
  .addParam("tokenName", "Contract Factory")
  .setAction(async (options, HRE) => {
    const networkName = HRE.network.name
    const ethers = HRE.ethers
    const tknName = String(options.tokenName)
    const deployer = (await ethers.getSigners())[0];
    const Token = await ethers.getContractFactory(String(options.tokenName));
    const Factory = await ethers.getContractFactory("Factory");

    const tkn: TokenDeploy = {
      networkName: networkName,
      tokenName: tknName,
      token: Token,
      factory: Factory,
      deployer: deployer
    }

    await tokenDeploy(tkn)
  });

task("deploy", "Deploy Glacier tokens contracts")
  .setAction(async (_, HRE) => {
    const networkName = HRE.network.name
    const ethers = HRE.ethers
    const deployer = (await ethers.getSigners())[0];
    const Factory = await ethers.getContractFactory("Factory");
    const FactoryRegistry = await ethers.getContractFactory("FactoryRegistry")
    
    console.log(`Network: ${networkName}`);
    console.log(`Deployer: ${deployer.address}`);

    let factoryRegistry;
    let factoryRegistryAddress;
    let factoryMsg;
    
    if (getDb(networkName).get("factoryRegistry").isEmpty().value()) {
      factoryRegistry = await FactoryRegistry.connect(deployer).deploy()
      console.log(`\nDeploying FactoryRegistry...`);
      await waitForTx(factoryRegistry.deployTransaction);

      getDb(networkName).set("factoryRegistry", {
        address: factoryRegistry.address,
        deployer: factoryRegistry.deployTransaction.from,
      }).write();

      factoryRegistryAddress = factoryRegistry.address
      factoryMsg = "FactoryRegistry";
    } else {
      factoryRegistryAddress = getDb(networkName).get("factoryRegistry").value().address;
      factoryMsg = "FactoryRegistry already";
      factoryRegistry = (await FactoryRegistry.connect(deployer).deploy()).attach(factoryRegistryAddress)
    }

    console.log(`\n${factoryMsg} Deployed!`);
    console.log(`FactoryRegistry Address: ${factoryRegistryAddress}`);

    const gTokens = Object.keys(GlacierToken).filter((v) => isNaN(Number(v)));
    const factories = await factoryRegistry.getFatoriesList()

    for (let i = 0; i < gTokens.length; i++) {
      let gToken = gTokens[i];

      let tkn: TokenDeploy = {
        networkName: networkName,
        tokenName: gToken,
        token: await ethers.getContractFactory(gToken),
        factory: Factory,
        deployer: deployer
      }
      await tokenDeploy(tkn)

      let factoryAddress = getDb(networkName).get(`${gToken}`).value().factory
            
      if (factories.indexOf(factoryAddress) > -1) {
        console.log(`\Factory${gToken} already on FactoryRegistry...`);
        continue;
      }
      
      let tx = await factoryRegistry.registerFactory(factoryAddress, i+1)
      console.log(`\nAdding Factory${gToken} to FactoryRegistry...`);
      await waitForTx(tx);
    }
  })
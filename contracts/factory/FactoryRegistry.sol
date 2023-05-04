// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "./Factory.sol";

contract FactoryRegistry is Ownable {
    mapping(address => bool) private _factories;
    address[] private _factoriesList;

    event FactoryRegistered(
        address indexed factory,
        string tokenName,
        string tokenSymbol,
        uint8 tokenDecimals,
        address indexed tokenAddress
    );

    event FactoryUnregistered(address indexed factory);

    function getFactoriesList() public view returns (address[] memory) {
        address[] memory activeFactories = new address[](_factoriesList.length);
        uint256 activeCount = 0;

        for (uint256 i = 0; i < _factoriesList.length; i++) {
            if (_factories[_factoriesList[i]]) {
                activeFactories[activeCount++] = _factoriesList[i];
            }
        }

        assembly {
            mstore(activeFactories, activeCount)
        }
        return activeFactories;
    }

    function registerFactory(address factory) external onlyOwner {
        require(factory != address(0), Errors.INVALID_ADDRESS);

        if (_factories[factory]) {
            return;
        }
        _factories[factory] = true;

        Factory f = Factory(factory);
        ERC20PresetMinterPauser t = ERC20PresetMinterPauser(f.token());

        emit FactoryRegistered(factory, t.name(), t.symbol(), t.decimals(), address(t));

        _factoriesList.push(factory);
    }

    function unregisterFactory(address factory) external onlyOwner {
        require(_factories[factory], Errors.NOT_FOUND);
        _factories[factory] = false;

        emit FactoryUnregistered(factory);
    }
}

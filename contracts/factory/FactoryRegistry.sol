// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "./Factory.sol";

contract FactoryRegistry is Ownable {
    mapping(address => uint256) private _factories;
    address[] private _factoriesList;

    event FactoryRegistered(
        address indexed factory,
        string tokenName,
        string tokenSymbol,
        uint8 tokenDecimals,
        address indexed tokenAddress
    );

    event FactoryUnregistered(address indexed factory);

    function getFatoriesList() public view returns (address[] memory) {
        address[] memory factoriesList = _factoriesList;

        uint256 maxLength = factoriesList.length;

        address[] memory activeFactories = new address[](maxLength);

        for (uint256 i = 0; i < maxLength; i++) {
            if (_factories[factoriesList[i]] > 0) {
                activeFactories[i] = factoriesList[i];
            }
        }

        return activeFactories;
    }

    function registerFactory(address factory, uint256 id) external onlyOwner {
        require(address(factory) != address(0), Errors.INVALID_ADDRESS);

        _factories[factory] = id;
        _addToFactoriesList(factory);
        Factory f = Factory(factory);
        ERC20PresetMinterPauser t = ERC20PresetMinterPauser(f.token());

        emit FactoryRegistered(factory, t.name(), t.symbol(), t.decimals(), address(t));
    }

    function unregisterFactory(address factory) external onlyOwner {
        require(_factories[factory] > 0, Errors.NOT_FOUND);
        _factories[factory] = 0;
        emit FactoryUnregistered(factory);
    }

    function getFactoryByAddress(address factory) external view returns (uint256) {
        return _factories[factory];
    }

    function _addToFactoriesList(address factory) internal {
        uint256 factoryCount = _factoriesList.length;

        for (uint256 i = 0; i < factoryCount; i++) {
            if (_factoriesList[i] == factory) {
                return;
            }
        }

        _factoriesList.push(factory);
    }
}

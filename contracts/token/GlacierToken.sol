// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract GlacierToken is ERC20PresetMinterPauser {
    uint8 _decimals;

    constructor(string memory _name, string memory _symbol, uint8 __decimals) ERC20PresetMinterPauser(_name, _symbol) {
        _decimals = __decimals;
    }

    function decimals() override public view returns(uint8) {
        return _decimals;
    }
}


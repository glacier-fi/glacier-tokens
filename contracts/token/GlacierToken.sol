// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract GlacierToken is ERC20PresetMinterPauser {
    uint8 _decimals;

    constructor(string memory _name, string memory _symbol, uint8 __decimals) ERC20PresetMinterPauser(_name, _symbol) {
        _decimals = __decimals;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}

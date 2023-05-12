// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./RequestToken.sol";
import "hardhat/console.sol";

contract RequestTokenRegistry is Ownable {
    using Clones for address;
    address public template;
    mapping(address => bool) private _requestTokens;
    address[] private _requestTokenList;

    constructor() {
        template = address(new RequestToken());
    }

    event Registered(
        address indexed requestToken,
        string tokenName,
        string tokenSymbol,
        uint8 tokenDecimals,
        address indexed tokenAddress
    );

    event Unregistered(
        address indexed factory,
        string tokenName,
        string tokenSymbol,
        uint8 tokenDecimals,
        address indexed tokenAddress
    );

    function getRequestTokenList() public view returns (address[] memory) {
        uint256 requestTokenCount = _requestTokenList.length;
        address[] memory activeRequestTokens = new address[](requestTokenCount);
        uint256 activeCount = 0;

        for (uint256 i = 0; i < requestTokenCount; i++) {
            if (_requestTokens[_requestTokenList[i]]) {
                activeRequestTokens[activeCount++] = _requestTokenList[i];
            }
        }

        assembly {
            mstore(activeRequestTokens, activeCount)
        }

        return activeRequestTokens;
    }

    function register(address requestToken) public onlyOwner {
        require(requestToken != address(0x0), Errors.INVALID_ADDRESS);

        if (_requestTokens[requestToken]) {
            return;
        }
        _requestTokens[requestToken] = true;

        _addToRequestTokenList(requestToken);

        RequestToken r = RequestToken(requestToken);
        ERC20PresetMinterPauser t = ERC20PresetMinterPauser(r.token());

        emit Registered(requestToken, t.name(), t.symbol(), t.decimals(), address(t));
    }

    function unregister(address requestToken) public onlyOwner {
        require(requestToken != address(0x0), Errors.INVALID_ADDRESS);
        require(_requestTokens[requestToken], Errors.NOT_FOUND);
        _requestTokens[requestToken] = false;

        RequestToken r = RequestToken(requestToken);
        ERC20PresetMinterPauser t = ERC20PresetMinterPauser(r.token());

        emit Unregistered(requestToken, t.name(), t.symbol(), t.decimals(), address(t));
    }

    function createRequestToken(ERC20PresetMinterPauser token) public onlyOwner {
        require(address(token) != address(0x0), Errors.INVALID_ADDRESS);
        require(token.hasRole(token.DEFAULT_ADMIN_ROLE(), address(this)), Errors.UNAUTHORIZED_TOKEN_ACCESS);

        address clone = template.clone();

        RequestToken(clone).initialize(_msgSender(), token);
        token.grantRole(token.MINTER_ROLE(), clone);

        register(clone);
    }

    function _addToRequestTokenList(address requestToken) internal {
        uint256 requestTokensCount = _requestTokenList.length;

        for (uint256 i = 0; i < requestTokensCount; i++) {
            if (_requestTokenList[i] == requestToken) {
                return;
            }
        }

        _requestTokenList.push(requestToken);
    }
}

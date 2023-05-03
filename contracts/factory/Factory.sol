// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Factory is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    enum RequestStatus {
        PENDING,
        APPROVED,
        CANCELLED,
        REJECTED
    }

    struct Request {
        address requester;
        uint256 amount;
        string txId;
        uint timestamp;
        RequestStatus status;
    }

    mapping(string => Request) public mintRequest;

    ERC20PresetMinterPauser public token;

    event MintRequestAdded(string _txId, Request _request);

    constructor(ERC20PresetMinterPauser _token) {
        require(address(_token) != address(0), "invalid _token address");
        
        token = _token;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());
    }

    function addMintRequest(
        uint256 _amount,
        string memory _txId
    ) external onlyRole(MINTER_ROLE) {
        require(_amount > 0, "Amount must be greater than 0");

        Request memory previous = mintRequest[_txId];

        if (previous.requester != address(0)) {
            revert(
                string.concat(
                    "AddMintRequest: txId ",
                    _txId,
                    " amount ",
                    Strings.toString(_amount),
                    " requested by ",
                    Strings.toHexString(_msgSender()),
                    " already sent it by ",
                    Strings.toHexString(previous.requester)
                )
            );
        }

        Request memory request = Request({
            requester: _msgSender(),
            amount: _amount,
            txId: _txId,
            timestamp: block.timestamp,
            status: RequestStatus.PENDING
        });

        mintRequest[_txId] = request;

        emit MintRequestAdded(_txId, request);
    }
}

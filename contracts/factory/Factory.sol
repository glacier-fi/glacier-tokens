// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Errors} from "../libraries/Errors.sol";

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
        uint timestamp;
        RequestStatus status;
    }

    mapping(string => Request) public mintRequest;

    ERC20PresetMinterPauser public token;

    event MintRequestAdded(Request request);
    event MintRequestCancelled(Request request);

    constructor(ERC20PresetMinterPauser _token) {
        require(address(_token) != address(0), Errors.INVALID_ADDRESS);

        token = _token;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());
    }

    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, _msgSender()), Errors.UNAUTHORIZED);
        _;
    }

    function cancelMintRequest(string memory txId) external onlyMinter {
        require(mintRequest[txId].amount > 0, Errors.NOT_FOUND);
        require(mintRequest[txId].requester == _msgSender(), Errors.SENDER_NOT_EQUAL_REQUESTER);
        require(mintRequest[txId].status == RequestStatus.PENDING, Errors.REQUEST_NOT_PENDING);

        mintRequest[txId].status = RequestStatus.CANCELLED;

        emit MintRequestCancelled(mintRequest[txId]);
    }

    function addMintRequest(uint256 amount, string memory txId) external onlyMinter {
        require(amount > 0, Errors.INVALID_AMOUNT);
        require(mintRequest[txId].amount == 0, Errors.REQUEST_ALREADY_EXISTS);

        mintRequest[txId] = Request({
            requester: _msgSender(),
            amount: amount,
            timestamp: block.timestamp,
            status: RequestStatus.PENDING
        });

        emit MintRequestAdded(mintRequest[txId]);
    }
}

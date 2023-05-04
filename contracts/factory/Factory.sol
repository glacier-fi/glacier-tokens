// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Errors} from "../libraries/Errors.sol";

contract Factory is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant CONFIRMER_ROLE = keccak256("CONFIRMER_ROLE");

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
    event MintRequestConfirmed(Request request);

    constructor(ERC20PresetMinterPauser _token) {
        require(address(_token) != address(0), Errors.INVALID_ADDRESS);

        token = _token;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());
        _setupRole(CONFIRMER_ROLE, _msgSender());
    }

    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, _msgSender()), Errors.UNAUTHORIZED);
        _;
    }

    modifier onlyConfirmer() {
        require(hasRole(CONFIRMER_ROLE, _msgSender()), Errors.UNAUTHORIZED);
        _;
    }

    function confirmMintRequest(string memory id) public onlyConfirmer {
        require(mintRequest[id].amount > 0, Errors.NOT_FOUND);
        require(mintRequest[id].status == RequestStatus.PENDING, Errors.REQUEST_NOT_PENDING);

        mintRequest[id].status = RequestStatus.APPROVED;

        emit MintRequestConfirmed(mintRequest[id]);

        token.mint(mintRequest[id].requester, mintRequest[id].amount);
    }

    function cancelMintRequest(string memory id) external onlyMinter {
        require(mintRequest[id].amount > 0, Errors.NOT_FOUND);
        require(mintRequest[id].requester == _msgSender(), Errors.SENDER_NOT_EQUAL_REQUESTER);
        require(mintRequest[id].status == RequestStatus.PENDING, Errors.REQUEST_NOT_PENDING);

        mintRequest[id].status = RequestStatus.CANCELLED;

        emit MintRequestCancelled(mintRequest[id]);
    }

    function addMintRequest(uint256 amount, string memory id) external onlyMinter {
        require(amount > 0, Errors.INVALID_AMOUNT);
        require(mintRequest[id].amount == 0, Errors.REQUEST_ALREADY_EXISTS);

        mintRequest[id] = Request({
            requester: _msgSender(),
            amount: amount,
            timestamp: block.timestamp,
            status: RequestStatus.PENDING
        });

        emit MintRequestAdded(mintRequest[id]);
    }
}

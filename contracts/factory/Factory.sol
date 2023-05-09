// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Errors} from "../libraries/Errors.sol";
import {DataTypes} from "../libraries/DataTypes.sol";

contract Factory is AccessControl {
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");
    bytes32 public constant CONFIRMER_ROLE = keccak256("CONFIRMER_ROLE");
    mapping(string => uint) public requestNonce;
    DataTypes.Request[] public requests;
    ERC20PresetMinterPauser public immutable token;

    event RequestAdded(DataTypes.Request request);
    event RequestRejected(DataTypes.Request request);
    event RequestCancelled(DataTypes.Request request);
    event RequestConfirmed(DataTypes.Request request);

    constructor(ERC20PresetMinterPauser _token) {
        require(address(_token) != address(0x0), Errors.INVALID_ADDRESS);

        token = _token;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(USER_ROLE, _msgSender());
        _setupRole(CONFIRMER_ROLE, _msgSender());
    }

    modifier onlyUser() {
        require(hasRole(USER_ROLE, _msgSender()), Errors.UNAUTHORIZED);
        _;
    }

    modifier onlyConfirmer() {
        require(hasRole(CONFIRMER_ROLE, _msgSender()), Errors.UNAUTHORIZED);
        _;
    }

    function confirmRequest(DataTypes.RequestType requestType, string memory id) external onlyConfirmer {
        if (requestNonce[id] == 0) {
            revert(Errors.NOT_FOUND);
        }

        DataTypes.Request storage request = requests[requestNonce[id] - 1];

        require(request.requestType == requestType, Errors.SENDER_REQUEST_TYPE_NOT_EQUAL_REQUESTER_REQUEST_TYPE);
        require(request.status == DataTypes.RequestStatus.PENDING, Errors.REQUEST_NOT_PENDING);

        if (requestType == DataTypes.RequestType.BURN) {
            token.burn(request.amount);
        } else {
            require(token.hasRole(token.MINTER_ROLE(), address(this)), Errors.UNAUTHORIZED_TOKEN_ACCESS);

            token.mint(request.requester, request.amount);
        }

        request.status = DataTypes.RequestStatus.APPROVED;

        emit RequestConfirmed(request);
    }

    function rejectRequest(DataTypes.RequestType requestType, string memory id) external onlyConfirmer {
        if (requestNonce[id] == 0) {
            revert(Errors.NOT_FOUND);
        }
        DataTypes.Request storage request = requests[requestNonce[id] - 1];

        require(request.requestType == requestType, Errors.SENDER_REQUEST_TYPE_NOT_EQUAL_REQUESTER_REQUEST_TYPE);
        require(request.status == DataTypes.RequestStatus.PENDING, Errors.REQUEST_NOT_PENDING);

        request.status = DataTypes.RequestStatus.REJECTED;

        if (requestType == DataTypes.RequestType.BURN) {
            token.transfer(request.requester, request.amount);
        }

        emit RequestRejected(request);
    }

    function cancelRequest(DataTypes.RequestType requestType, string memory id) external onlyUser {
        if (requestNonce[id] == 0) {
            revert(Errors.NOT_FOUND);
        }

        DataTypes.Request storage request = requests[requestNonce[id] - 1];

        require(request.requestType == requestType, Errors.SENDER_REQUEST_TYPE_NOT_EQUAL_REQUESTER_REQUEST_TYPE);
        require(request.requester == _msgSender(), Errors.SENDER_NOT_EQUAL_REQUESTER);
        require(request.status == DataTypes.RequestStatus.PENDING, Errors.REQUEST_NOT_PENDING);

        request.status = DataTypes.RequestStatus.CANCELLED;

        if (requestType == DataTypes.RequestType.BURN) {
            token.transfer(request.requester, request.amount);
        }

        emit RequestCancelled(request);
    }

    function addRequest(DataTypes.RequestType requestType, uint256 amount, string memory id) external onlyUser {
        require(amount > 0, Errors.INVALID_AMOUNT);

        if (requestNonce[id] != 0) {
            revert(Errors.REQUEST_ALREADY_EXISTS);
        }

        if (requestType == DataTypes.RequestType.BURN) {
            uint256 userBalance = token.balanceOf(_msgSender());
            require(amount <= userBalance, Errors.NOT_ENOUGH_AVAILABLE_USER_BALANCE);
        } else {
            require(token.hasRole(token.MINTER_ROLE(), address(this)), Errors.UNAUTHORIZED_TOKEN_ACCESS);
        }

        uint256 blockNumber = block.number;
        bytes32 blockHash = blockhash(blockNumber);

        requestNonce[id] = requests.length + 1;

        DataTypes.Request memory request = DataTypes.Request({
            nonce: requestNonce[id],
            requestType: requestType,
            requester: _msgSender(),
            amount: amount,
            blockhash: blockHash,
            status: DataTypes.RequestStatus.PENDING
        });

        requests.push(request);

        if (requestType == DataTypes.RequestType.BURN) {
            token.transferFrom(msg.sender, address(this), amount);
        }

        emit RequestAdded(request);
    }
}

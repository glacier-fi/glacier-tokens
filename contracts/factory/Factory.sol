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

    event RequestAdded(DataTypes.RequestType, DataTypes.Request request);
    event RequestRejected(DataTypes.RequestType, DataTypes.Request request);
    event RequestCancelled(DataTypes.RequestType, DataTypes.Request request);
    event RequestConfirmed(DataTypes.RequestType, DataTypes.Request request);

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
        DataTypes.Request storage request = requests[requestNonce[id]];

        require(request.amount > 0, Errors.NOT_FOUND);
        require(request.status == DataTypes.RequestStatus.PENDING, Errors.REQUEST_NOT_PENDING);

        if (requestType == DataTypes.RequestType.BURN) {
            token.burn(request.amount);
        } else if (requestType == DataTypes.RequestType.MINT) {
            require(token.hasRole(token.MINTER_ROLE(), address(this)), Errors.UNAUTHORIZED_TOKEN_ACCESS);

            token.mint(request.requester, request.amount);
        } else {
            revert(Errors.INVALID_REQUEST_TYPE);
        }
        request.status = DataTypes.RequestStatus.APPROVED;

        emit RequestConfirmed(requestType, request);
    }

    function rejectRequest(DataTypes.RequestType requestType, string memory id) external onlyConfirmer {
        require(
            requestType == DataTypes.RequestType.BURN || requestType == DataTypes.RequestType.MINT,
            Errors.INVALID_REQUEST_TYPE
        );

        DataTypes.Request storage request = requests[requestNonce[id]];

        require(request.amount > 0, Errors.NOT_FOUND);
        require(request.status == DataTypes.RequestStatus.PENDING, Errors.REQUEST_NOT_PENDING);

        request.status = DataTypes.RequestStatus.REJECTED;

        emit RequestRejected(requestType, request);
    }

    function cancelRequest(DataTypes.RequestType requestType, string memory id) external onlyUser {
        require(
            requestType == DataTypes.RequestType.BURN || requestType == DataTypes.RequestType.MINT,
            Errors.INVALID_REQUEST_TYPE
        );

        DataTypes.Request storage request = requests[requestNonce[id]];

        require(request.amount > 0, Errors.NOT_FOUND);
        require(request.requester == _msgSender(), Errors.SENDER_NOT_EQUAL_REQUESTER);
        require(request.status == DataTypes.RequestStatus.PENDING, Errors.REQUEST_NOT_PENDING);

        request.status = DataTypes.RequestStatus.CANCELLED;

        if (requestType == DataTypes.RequestType.BURN) {
            token.transfer(request.requester, request.amount);
        }

        emit RequestCancelled(requestType, request);
    }

    function addRequest(DataTypes.RequestType requestType, uint256 amount, string memory id) external onlyUser {
        require(amount > 0, Errors.INVALID_AMOUNT);

        if (requestNonce[id] != 0) {
            revert(Errors.REQUEST_ALREADY_EXISTS);
        }

        if (requestType == DataTypes.RequestType.BURN) {
            uint256 userBalance = token.balanceOf(_msgSender());
            require(amount <= userBalance, Errors.NOT_ENOUGH_AVAILABLE_USER_BALANCE);
        } else if (requestType == DataTypes.RequestType.MINT) {
            require(token.hasRole(token.MINTER_ROLE(), address(this)), Errors.UNAUTHORIZED_TOKEN_ACCESS);
        } else {
            revert(Errors.INVALID_REQUEST_TYPE);
        }

        uint256 blockNumber = block.number;
        bytes32 blockHash = blockhash(blockNumber);

        requestNonce[id] = requests.length;

        requests.push(
            DataTypes.Request({
                nonce: requestNonce[id],
                requestType: requestType,
                requester: _msgSender(),
                amount: amount,
                blockhash: blockHash,
                status: DataTypes.RequestStatus.PENDING
            })
        );

        if (requestType == DataTypes.RequestType.BURN) {
            token.transferFrom(msg.sender, address(this), amount);
        }

        emit RequestAdded(requestType, requests[requestNonce[id]]);
    }
}

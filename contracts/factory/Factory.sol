// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Errors} from "../libraries/Errors.sol";
import {DataTypes} from "../libraries/DataTypes.sol";

contract Factory is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant CONFIRMER_ROLE = keccak256("CONFIRMER_ROLE");

    mapping(string => DataTypes.Request) public mintRequest;
    mapping(string => DataTypes.Request) public burnRequest;

    ERC20PresetMinterPauser public immutable token;

    event MintRequestAdded(DataTypes.Request request);
    event MintRequestCancelled(DataTypes.Request request);
    event MintRequestConfirmed(DataTypes.Request request);
    event MintRequestRejected(DataTypes.Request request);
    event BurnRequestAdded(DataTypes.Request request);

    constructor(ERC20PresetMinterPauser _token) {
        require(address(_token) != address(0x0), Errors.INVALID_ADDRESS);

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

    modifier onlyBurner() {
        require(hasRole(BURNER_ROLE, _msgSender()), Errors.UNAUTHORIZED);
        _;
    }

    modifier onlyConfirmer() {
        require(hasRole(CONFIRMER_ROLE, _msgSender()), Errors.UNAUTHORIZED);
        _;
    }

    function confirmMintRequest(string memory id) external onlyConfirmer {
        require(mintRequest[id].amount > 0, Errors.NOT_FOUND);
        require(mintRequest[id].status == DataTypes.RequestStatus.PENDING, Errors.REQUEST_NOT_PENDING);

        mintRequest[id].status = DataTypes.RequestStatus.APPROVED;

        emit MintRequestConfirmed(mintRequest[id]);

        token.mint(mintRequest[id].requester, mintRequest[id].amount);
    }

    function rejectMintRequest(string memory id) external onlyConfirmer {
        require(mintRequest[id].amount > 0, Errors.NOT_FOUND);
        require(mintRequest[id].status == DataTypes.RequestStatus.PENDING, Errors.REQUEST_NOT_PENDING);

        mintRequest[id].status = DataTypes.RequestStatus.REJECTED;

        emit MintRequestRejected(mintRequest[id]);
    }

    function cancelMintRequest(string memory id) external onlyMinter {
        require(mintRequest[id].amount > 0, Errors.NOT_FOUND);
        require(mintRequest[id].requester == _msgSender(), Errors.SENDER_NOT_EQUAL_REQUESTER);
        require(mintRequest[id].status == DataTypes.RequestStatus.PENDING, Errors.REQUEST_NOT_PENDING);

        mintRequest[id].status = DataTypes.RequestStatus.CANCELLED;

        emit MintRequestCancelled(mintRequest[id]);
    }

    function addMintRequest(uint256 amount, string memory id) external onlyMinter {
        require(amount > 0, Errors.INVALID_AMOUNT);
        require(mintRequest[id].amount == 0, Errors.REQUEST_ALREADY_EXISTS);

        mintRequest[id] = DataTypes.Request({
            requester: _msgSender(),
            amount: amount,
            blockhash: blockhash(block.number),
            status: DataTypes.RequestStatus.PENDING
        });

        emit MintRequestAdded(mintRequest[id]);
    }

    function addBurnRequest(uint256 amount, string memory id) external onlyBurner {
        require(amount > 0, Errors.INVALID_AMOUNT);
        require(burnRequest[id].amount == 0, Errors.REQUEST_ALREADY_EXISTS);

        burnRequest[id] = DataTypes.Request({
            requester: _msgSender(),
            amount: amount,
            blockhash: blockhash(block.number),
            status: DataTypes.RequestStatus.PENDING
        });

        emit BurnRequestAdded(burnRequest[id]);
    }
}

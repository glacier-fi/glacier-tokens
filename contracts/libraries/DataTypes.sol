// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

library DataTypes {
    enum RequestStatus {
        PENDING,
        APPROVED,
        CANCELLED,
        REJECTED
    }

    enum RequestType {
        MINT,
        BURN
    }

    struct Request {
        uint nonce;
        RequestType requestType;
        address requester;
        uint256 amount;
        bytes32 blockhash;
        RequestStatus status;
    }
}

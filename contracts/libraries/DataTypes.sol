// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

library DataTypes {
    enum RequestStatus {
        PENDING,
        APPROVED,
        CANCELLED,
        REJECTED
    }

    struct Request {
        address requester;
        uint256 amount;
        bytes32 blockhash;
        RequestStatus status;
    }
}

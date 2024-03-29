// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

library Errors {
    string public constant INVALID_ADDRESS = "0";
    string public constant UNAUTHORIZED = "1";
    string public constant NOT_FOUND = "2";
    string public constant SENDER_NOT_EQUAL_REQUESTER = "3";
    string public constant REQUEST_NOT_PENDING = "4";
    string public constant REQUEST_ALREADY_EXISTS = "5";
    string public constant INVALID_AMOUNT = "6";
    string public constant UNAUTHORIZED_TOKEN_ACCESS = "7";
    string public constant NOT_ENOUGH_AVAILABLE_USER_BALANCE = "8";
    string public constant SENDER_REQUEST_TYPE_NOT_EQUAL_REQUESTER_REQUEST_TYPE = "9";
}

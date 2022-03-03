const PERMIT_TYPE_HASH = '0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9'; // EIP2612
const PERMIT_ALLOWED_TYPE_HASH = '0xea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb'; // DAI and the like
const MULTICALL2_ADDRESS = '0x5ba1e12693dc8f9c48aad8770482f4739beed696';
const MULTICALL2_ABI = [
    'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) public returns(tuple(bool success, bytes returnData)[])',
];

const ABI_COMMON = [
    'function name() external view returns (string)',
    'function symbol() external view returns (string)',
    'function version() external view returns (string)',
    'function DOMAIN_SEPARATOR() external view returns (bytes32)',
    'function DOMAIN_TYPEHASH() external view returns (bytes32)',
    'function nonces(address owner) external view returns (uint)',
    'function PERMIT_TYPEHASH() external view returns (bytes32)',
    'function allowance(address owner, address spender) external view returns (uint256)',
]
const ABI_PERMIT = [
    ...ABI_COMMON,
    'function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s)',
];
const ABI_PERMIT_ALLOWED = [
    ...ABI_COMMON,
    'function permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s)',
];
const ABI_PERMIT_PACKED = [
    ...ABI_COMMON,
    'function permit(address owner, address spender, uint value, uint deadline, bytes signature)',
];
const TYPES_PERMIT = {
    "Permit": [{
          "name": "owner",
          "type": "address"
        },
        {
          "name": "spender",
          "type": "address"
        },
        {
          "name": "value",
          "type": "uint256"
        },
        {
          "name": "nonce",
          "type": "uint256"
        },
        {
          "name": "deadline",
          "type": "uint256"
        },
    ],
};
const TYPES_PERMIT_ALLOWED = {
    "Permit": [{
        "name": "holder",
        "type": "address"
        },
        {
          "name": "spender",
          "type": "address"
        },
        {
          "name": "nonce",
          "type": "uint256"
        },
        {
          "name": "expiry",
          "type": "uint256"
        },
        {
          "name": "allowed",
          "type": "bool"
        },
    ],
};


module.exports = {
    PERMIT_TYPE_HASH,
    PERMIT_ALLOWED_TYPE_HASH,
    ABI_PERMIT,
    ABI_PERMIT_ALLOWED,
    ABI_PERMIT_PACKED,
    TYPES_PERMIT,
    TYPES_PERMIT_ALLOWED,
    MULTICALL2_ADDRESS,
    MULTICALL2_ABI,
}
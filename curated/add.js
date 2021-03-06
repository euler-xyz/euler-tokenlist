module.exports = [
  // market activated, symbol matches WILD (Wilder World) triggering possible upgrade warning. Adding here to silence it.
  {
    "address": "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
    "name": "Ethereum Name Service",
  },
  {
    "address": "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
    "name": "Synthetix Network Token",
  },
  {
    "address": "0xb05097849bca421a3f51b249ba6cca4af4b97cb9",
    "name": "Float Protocol: FLOAT"
  },
  {
    "address": "0x6243d8cea23066d098a15582d81a598b4e8391f4",
    "name": "Flex Ungovernance Token",
  },
  {
    "address": "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3",
    "name": "Magic Internet Money",
  },
  {
    "address": "0xdd1ad9a21ce722c151a836373babe42c868ce9a4",
    "name": "Universal Basic Income",
  },
  {
    "name": "ApeCoin",
    "address": "0x4d224452801ACEd8B2F0aebE155379bb5D594381",
    "symbol": "APE",
    "decimals": 18,
    "chainId": 1,
    "logoURI": "https://s2.coinmarketcap.com/static/img/coins/64x64/18876.png"
  },
  {
    "name": "Axelar Wrapped ATOM",
    "address": "0x27292cf0016e5df1d8b37306b2a98588acbd6fca",
    "symbol": "axlATOM",
    "decimals": 6,
    "chainId": 1,
    "logoURI": "https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png",
    "extensions": {
      "permit": {
        "type": "EIP2612",
        "domain": {
          "name": "Axelar Wrapped ATOM",
          "version": "1",
          "chainId": 1,
          "verifyingContract": "0x27292cf0016e5df1d8b37306b2a98588acbd6fca"
        }
      }
    }
  },
  {
    "name": "Ribbon ETH Theta Vault",
    "address": "0x25751853eab4d0eb3652b5eb6ecb102a2789644b",
    "symbol": "rETH-THETA",
    "decimals": 18,
    "chainId": 1,
    "logoURI": ""
  },
  {
    "name": "Euler",
    "address": "0xd9fcd98c322942075a5c3860693e9f4f03aae07b",
    "chainId": 1,
    "symbol": "EUL",
    "decimals": 18,
    "logoURI": "https://s2.coinmarketcap.com/static/img/coins/64x64/14280.png",
    "extensions": {
       "permit": {
          "type": "EIP2612",
          "domain": {
             "name": "Euler",
             "version": "1",
             "chainId": 1,
             "verifyingContract": "0xd9fcd98c322942075a5c3860693e9f4f03aae07b"
          }
       }
    }
  },
];

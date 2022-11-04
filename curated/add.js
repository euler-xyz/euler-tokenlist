module.exports = [
  // market activated, symbol matches WILD (Wilder World) triggering possible upgrade warning. Adding here to silence it.
  {
    "address": "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
    "name": "Ethereum Name Service",
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
    "name": "Goo",
    "address": "0x600000000a36f3cd48407e35eb7c5c910dc1f7a8",
    "symbol": "GOO",
    "decimals": 18,
    "chainId": 1,
    "logoURI": "https://s2.coinmarketcap.com/static/img/coins/64x64/22514.png",
    "extensions": {
      "permit": {
        "type": "EIP2612",
        "domain": {
          "name": 'Goo',
          "version": '1',
          "chainId": 1,
          "verifyingContract": '0x600000000a36f3cd48407e35eb7c5c910dc1f7a8'
        }
      }
    }
  },
];

module.exports = [
  // token migrated to new contract
  { 
    "chainId": 1,
    "address": "0x08a75dbc7167714ceac1a8e43a8d643a4edd625a",
    "name": "Wild Credit",
    "symbol": "WILD",
    "decimals": 18,
    "logoURI": "https://assets.coingecko.com/coins/images/17206/thumb/wild.PNG?1626848440"
  },
  {
    "chainId": 1,
    "address": "0x321c2fe4446c7c963dc41dd58879af648838f98d",
    "name": "Cryptex Finance",
    "symbol": "CTX",
    "decimals": 18,
    "logoURI": "https://assets.coingecko.com/coins/images/14932/thumb/glossy_icon_-_C200px.png?1619073171",
    "extensions": {
      "permit": {
        "type": "EIP2612",
        "domain": {
          "name": "Cryptex",
          "chainId": 1,
          "verifyingContract": "0x321c2fe4446c7c963dc41dd58879af648838f98d"
        }
      }
    }
  },
];

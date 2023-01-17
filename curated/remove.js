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
  {
    "chainId": 1,
    "address": "0x57ab1ec28d129707052df4df418d58a2d46d5f51",
    "name": "sUSD",
    "symbol": "SUSD",
    "decimals": 18,
    "logoURI": "https://assets.coingecko.com/coins/images/5013/large/sUSD.png?1616150765"
  },
  {
    "chainId": 1,
    "address": "0xd1ba9bac957322d6e8c07a160a3a8da11a0d2867",
    "name": "HUMAN Protocol",
    "symbol": "HMT",
    "decimals": 18,
    "logoURI": "https://assets.coingecko.com/coins/images/16412/large/human_protocol.PNG?1623971316"
  },
  {
    "chainId": 1,
    "address": "0x99ea4db9ee77acd40b119bd1dc4e33e1c070b80d",
    "name": "Quantstamp",
    "symbol": "QSP",
    "decimals": 18,
    "logoURI": "https://assets.coingecko.com/coins/images/1219/large/0_E0kZjb4dG4hUnoDD_.png?1604815917"
  },
  {
    "chainId": 1,
    "address": "0xd909c5862cdb164adb949d92622082f0092efc3d",
    "name": "Interest Protocol Token",
    "symbol": "IPT",
    "decimals": 18,
    "logoURI": "https://assets.coingecko.com/coins/images/27000/large/logo.white_%281%29.png?1661328083",
    "extensions": {
      "permit": {
        "type": "EIP2612",
        "domain": {
          "name": "Interest Protocol",
          "chainId": 1,
          "verifyingContract": "0xd909c5862cdb164adb949d92622082f0092efc3d"
        }
      }
    }
  },
  {
    "chainId": 1,
    "address": "0x383518188c0c6d7730d91b2c03a03c837814a899",
    "name": "Olympus v1",
    "symbol": "OHM",
    "decimals": 9,
    "logoURI": "https://assets.coingecko.com/coins/images/21496/large/OHM.jpg?1639620224",
    "extensions": {
      "permit": {
        "type": "EIP2612",
        "domain": {
          "name": "Olympus",
          "version": "1",
          "chainId": 1,
          "verifyingContract": "0x383518188c0c6d7730d91b2c03a03c837814a899"
        }
      }
    }
  },
  {
    "chainId": 1,
    "address": "0x31c8eacbffdd875c74b94b077895bd78cf1e64a3",
    "name": "Radicle",
    "symbol": "RAD",
    "decimals": 18,
    "logoURI": "https://assets.coingecko.com/coins/images/14013/large/radicle.png?1614402918",
    "extensions": {
      "permit": {
        "type": "EIP2612",
        "domain": {
          "name": "Radicle",
          "chainId": 1,
          "verifyingContract": "0x31c8eacbffdd875c74b94b077895bd78cf1e64a3"
        }
      }
    }
  },
];

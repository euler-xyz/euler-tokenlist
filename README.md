# Euler Tokenlist

- Euler platform token list
- Automatic permit support detection tools
- Coingecko tokenlist with detected permit support data, updated daily

## Permit detection
Detect permit support on a single token:
```bash
npm run detect-permit 0x123..def
```

Run detection on a token list, passing the url and a file name for the results:
```bash
npm run detect-permit:list https://tokens.coingecko.com/uniswap/all.json coingecko-tokenlist-with-permits.json
```

### Config
The only configuration required for permit detection is a JSON RPC endpoint in a `.env` file.

```bash
JSON_RPC_URL=https://your-json-rpc-provider
```

Optionally:
- `CHAIN_ID` can be set, although the scripts have not been tested with chains other than Ethereum.
- `MULTICALL2_ADDRESS` internally the tool uses [MakerDao Multicall2](https://github.com/makerdao/multicall/blob/master/src/Multicall2.sol) contract. If `CHAIN_ID` is modified, this address also needs to be updated.
- `DETECT_PERMIT_BATCH_SIZE` controls the number of tokens processed in parallel. Default is 20, set to lower value in case of network / provider errors.

### Detection logic and results
The algorithm uses a number of heuristics to automatically detect permit support in a token contract. In the first step, functions like `nonces`, `DOMAIN_SEPARATOR`, `PERMIT_TYPEHASH` are probed. If they return results, the token is flagged as possibly supporting permits. In the next step, the `permit` function is static-called with signatures constructed using common domain separator values. If the call is successful, the `allowance` function is called to verify the result matches the permit.

When permit support is detected, the result returned is the type of permit, with optional variant, and domain separator values.
```bash
❯ npm run detect-permit 0x6B175474E89094C44Da98b954EedeAC495271d0F

DETECTED: ALLOWED 
{
  name: 'Dai Stablecoin',
  version: '1',
  chainId: 1,
  verifyingContract: '0x6b175474e89094c44da98b954eedeac495271d0f'
}
```

Possible permit types are `EIP2612` and `ALLOWED` (implementation introduced in DAI), both described in the [EIP2612](https://eips.ethereum.org/EIPS/eip-2612). 
Not all contracts implement the standard to the letter. For some common patterns an additional `variant` might be provided. Currently two EIP2612 variants are supported by the detection tool:
- `UNDERSCORE_NONCES` - the token implements `_nonces` function instead of the standard `nonces`
- `PACKED` - the `permit` function accepts a raw `bytes` signature instead of the standard `r`, `s`, `v` values

If detection fails but the token is flagged as possibly supporting permits, an error is returned along with a list of logs. In such cases it is necessary to review the contract manually. There might be a number of issues, like deviation from the standard or bugs. In other cases, the permit support is implemented correctly, but the domain separator is built with uncommon values. To handle these instances, the tool accepts a curated list which overrides the detection results. `curated/permits.js` file contains the opinionated list maintained by Euler.

When the tool is run to process the tokenlist, the result is a new tokenlist, with additional permit data in `extensions` property, which is compliant with the [Uniswap tokenlist standard](https://github.com/Uniswap/token-lists).
```json
{
  "chainId": 1,
  "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "name": "USD Coin",
  "symbol": "USDC",
  "decimals": 6,
  "logoURI": "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389",
  "extensions": {
    "permit": {
      "type": "EIP2612",
      "domain": {
        "name": "USD Coin",
        "version": "2",
        "chainId": 1,
        "verifyingContract": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
      }
    }
  }
}
```

## Coingecko list with permits

The full [Coingecko token list](https://tokens.coingecko.com/uniswap/all.json) is processed daily to detect permit support in all tokens. The results are commited to the repo and available in `coingecko-tokenlist-with-permits.json` and under a [url]('https://raw.githubusercontent.com/euler-xyz/euler-tokenlist/master/coingecko-tokenlist-with-permits.json').

## Euler token list

Euler token list is updated with `updateEulerList.js` script, which is meant to be run with `pm2`
```bash
pm2 start ecosystem.config.js
``` 

The script:
- downloads a new Coingecko list,
- runs permit detection
- filters out tokens without Uniswap V3 WETH pair pools
- removes tokens from the euler list not present in the new list, unless there is an activated Euler market with that underlying
- updates existing token data if necessary
- adds new tokens if present
- applies curated overrides
- commits changes in git and pushes the repo

### Config

In addition to permit detection config, it is required to provide `TOKENLIST_URL` and `PROCESSED_LIST_FILE_NAME` (currently `coingecko-tokenlist-with-permits.json`). To automatically commit changes, `UPDATE_REPO` must be set to `true`. For Cloudwatch logging set up `CLOUDWATCH_LOG_GROUP`, `CLOUDWATCH_LOG_STREAM` and `AWS_REGION`.

### Adding and removing tokens manually

To add or remove tokens from the Euler list manually, edit `curated/add.js` and `curated/remove.js` respectively. These patches will always be applied to the Euler list, regardless of the source token list.
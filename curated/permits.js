module.exports = {
  // Unusual domain values

  '0xc944e90c64b2c07662a292be6244bdf05cda44a7': {
      permitType: 'EIP2612',
      domain: {
          name: "Graph Token",
          version: "0",
          chainId: 1,
          verifyingContract: '0xc944e90c64b2c07662a292be6244bdf05cda44a7',
          salt: '0x51f3d585afe6dfeb2af01bba0889a36c1db03beec88c6a4d0c53817069026afa',
      }
  },
  '0x9d409a0a012cfba9b15f6d4b36ac57a46966ab9a': { // yvBoost
      permitType: 'Packed',
      domain: {
          name: 'Yearn Vault',
          version: '0.3.5', // returned by apiVersion()
          chainId: 1,
          verifyingContract: '0x9d409a0a012cfba9b15f6d4b36ac57a46966ab9a',
      },
  },
  '0x24a6a37576377f63f194caa5f518a60f45b42921': { // BANK
      permitType: 'EIP2612',
      domain: {
          name: 'Float Protocol: BANK',
          version: '2',
          chainId: 1,
          verifyingContract: '0x24a6a37576377f63f194caa5f518a60f45b42921',
      },
  },
  '0x6b0b3a982b4634ac68dd83a4dbf02311ce324181': { // ALI
      permitType: 'EIP2612',
      domain: {
        name: 'AliERC20v2',
        chainId: 1,
        verifyingContract: '0x6b0b3a982b4634ac68dd83a4dbf02311ce324181'
      },
  },
  '0x3be5d86be59a9ccd990f054f234c02f6d0d48512': { // XPAD
      permitType: 'EIP2612',
      domain: {
        name: 'XPad',
        version: '1',
        chainId: 1,
        verifyingContract: '0x3be5d86be59a9ccd990f054f234c02f6d0d48512'
      },
  },
  '0xae6e307c3fe9e922e5674dbd7f830ed49c014c6b': { // CREDI
      permitType: 'EIP2612',
      domain: {
        name: 'Credi',
        version: '1',
        chainId: 1,
        verifyingContract: '0xae6e307c3fe9e922e5674dbd7f830ed49c014c6b'
      },
  },
  '0xdef1fac7bf08f173d286bbbdcbeeade695129840': { // CERBY
      permitType: 'EIP2612',
      domain: {
        name: 'Defi Factory Token',
        version: '1',
        chainId: 1,
        verifyingContract: '0xdef1fac7bf08f173d286bbbdcbeeade695129840'
      },
  },
  '0xf0939011a9bb95c3b791f0cb546377ed2693a574': { // ZERO
      permitType: 'EIP2612',
      domain: {
        name: 'Zero Exchange Token',
        version: '1',
        chainId: 1,
        verifyingContract: '0xf0939011a9bb95c3b791f0cb546377ed2693a574'
      },
  },
  '0x6f80310ca7f2c654691d1383149fa1a57d8ab1f8': { // SILO
      permitType: 'EIP2612',
      domain: {
        name: 'SiloGovernanceToken',
        version: '1',
        chainId: 1,
        verifyingContract: '0x6f80310ca7f2c654691d1383149fa1a57d8ab1f8'
      },
  },
  '0x52a8845df664d76c69d2eea607cd793565af42b8': { // APEX
      permitType: 'EIP2612',
      domain: {
        name: '',
        version: '1',
        chainId: 1,
        verifyingContract: '0x52a8845df664d76c69d2eea607cd793565af42b8'
      },
  },
  '0x632806bf5c8f062932dd121244c9fbe7becb8b48': { // PDI
      permitType: 'EIP2612',
      domain: {
        name: 'PhutureIndex',
        version: '1',
        chainId: 1,
        verifyingContract: '0x632806bf5c8f062932dd121244c9fbe7becb8b48'
      },
  },
  '0x1abaea1f7c830bd89acc67ec4af516284b1bc33c': { // EURC
      permitType: 'EIP2612',
      domain: {
        name: 'SSS Coin',
        version: '2',
        chainId: 1,
        verifyingContract: '0x1abaea1f7c830bd89acc67ec4af516284b1bc33c'
      },
  },

  // Contracts with intended permit support with various issues

  '0x7f0693074f8064cfbcf9fa6e5a3fa0e4f58ccccf': 'not supported', // GM - permit handles NFTs
  '0xcc7ab8d78dba187dc95bf3bb86e65e0c26d0041f': 'not supported', // SPACE - domain separator not initialized properly
  '0x4f81c790581b240a5c948afd173620ecc8c71c8d': 'not supported', // XDG - domain separator not initialized
  '0xd69f306549e9d96f183b1aeca30b8f4353c2ecc3': 'not supported', // MCHC - domain typehash doesn't match domain separator (typehash doesn't include version)
  '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44': 'not supported', // KP3R - non standard encoding of typehashes ('uint' alias used)
  '0x33349b282065b0284d756f0577fb39c158f935e6': 'not supported', // MPL - non standard, using 'amount' instead of 'value' in permit typehash:
  '0x226f7b842e0f0120b7e194d05432b3fd14773a9d': 'not supported', // UNN - contract not verified on etherscan
  '0xc5bddf9843308380375a611c18b50fb9341f502a': 'not supported', // yveCRV-DAO - non standard encoding of typehashes ('uint' alias used)
  '0x058bc8ef040bd3971418e36aa88b64899378ccf4': 'not supported', // DONA - non standard permit logic implementation (owner replaced by msg.sender)
  '0xe9f84de264e91529af07fa2c746e934397810334': 'not supported', // SAK3 - non standard permit logic implementation (owner replaced by msg.sender)
  '0x5166e09628b696285e3a151e84fb977736a83575': 'not supported', // VOL - non standard permit logic implementation (owner replaced by msg.sender)
  '0x6a68de599e8e0b1856e322ce5bd11c5c3c79712b': 'not supported', // IBY - non standard permit logic implementation (owner replaced by msg.sender)
  '0xd084944d3c05cd115c09d072b9f44ba3e0e45921': 'not supported', // FOLD - non standard permit logic implementation (owner replaced by msg.sender)
  '0xa456b515303b2ce344e9d2601f91270f8c2fea5e': 'not supported', // CORN - non standard vyper implementation
  '0x99fe3b1391503a1bc1788051347a1324bff41452': 'not supported', // SX - non standard typehash ('holder' for 'owner')
  '0x9c78ee466d6cb57a4d01fd887d2b5dfb2d46288f': 'not supported', // MUST - non standard domain type hash
  '0xe46f290cd59195a83e757891430d8d517d16b334': 'not supported', // AFN - proxy contract, unknown implementation
  '0xa54d2ebfd977ad836203c85f18db2f0a0cf88854': 'not supported', // BACON - proxy contract, unknown implementation
  '0xb6c4267c4877bb0d6b1685cfd85b0fbe82f105ec': 'not supported', // REL - non standard getNonce
  '0x429876c4a6f89fb470e92456b8313879df98b63c': 'not supported', // CNT - non standard getNonce
  '0xc22b30e4cce6b78aaaadae91e44e73593929a3e9': 'not supported', // RAC - non standard permitNonce
  '0xcdf7028ceab81fa0c6971208e83fa7872994bee5': 'not supported', // T - non standard nonce
  '0xfd9cd8c0d18cd7e06958f3055e0ec3adbdba0b17': 'not supported', // STFI - not investigated
  '0x6100dd79fcaa88420750dcee3f735d168abcb771': 'not supported', // OS - not investigated
  '0xf0f9d895aca5c8678f706fb8216fa22957685a13': 'not supported', // CULT - not investigated
  '0x0cd022dde27169b20895e0e2b2b8a33b25e63579': 'not supported', // RISE - not investigated
  '0x0e498afce58de8651b983f136256fa3b8d9703bc': 'not supported', // DOC - using symbol for version
  '0xc17c30e98541188614df99239cabd40280810ca3': 'not supported', // RISE (new?)- non standard per user domain separator
}
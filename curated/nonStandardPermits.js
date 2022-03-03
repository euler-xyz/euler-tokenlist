module.exports = {
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
//   '0xbe1a001fe942f96eea22ba08783140b9dcc09d28': { // Beta
//       permitType: 'EIP2612',
//       domain: {
//           name: 'BETA',
//           version: '1',
//           chainId: 1,
//           verifyingContract: '0xbe1a001fe942f96eea22ba08783140b9dcc09d28',
//       },
//   },
  '0x24a6a37576377f63f194caa5f518a60f45b42921': { // BANK
      permitType: 'EIP2612',
      domain: {
          name: 'Float Protocol: BANK',
          version: '2',
          chainId: 1,
          verifyingContract: '0x24a6a37576377f63f194caa5f518a60f45b42921',
      },
  },
//   '0x7ae1d57b58fa6411f32948314badd83583ee0e8c': { // PAPER
//       permitType: 'EIP2612',
//       domain: {
//           name: 'PAPER',
//           version: '1',
//           chainId: 1,
//           verifyingContract: '0x7ae1d57b58fa6411f32948314badd83583ee0e8c',
//       },
//   },
//   '0x0fd10b9899882a6f2fcb5c371e17e70fdee00c38': { // PUNDIX
//       permitType: 'EIP2612',
//       domain: {
//           name: 'PUNDIX',
//           version: '1',
//           chainId: 1,
//           verifyingContract: '0x0fd10b9899882a6f2fcb5c371e17e70fdee00c38'
//       },
//   },
//   '0xe80c0cd204d654cebe8dd64a4857cab6be8345a3': { // JPEG
//       permitType: 'EIP2612',
//       domain: {
//         name: 'JPEG',
//         version: '1',
//         chainId: 1,
//         verifyingContract: '0xe80c0cd204d654cebe8dd64a4857cab6be8345a3'
//       },
//   },
//   '0xd779eea9936b4e323cddff2529eb6f13d0a4d66e': { // ENTR
//       permitType: 'EIP2612',
//       domain: {
//         name: 'ENTR',
//         version: '1',
//         chainId: 1,
//         verifyingContract: '0xd779eea9936b4e323cddff2529eb6f13d0a4d66e'
//       },
//   },
  '0x6b0b3a982b4634ac68dd83a4dbf02311ce324181': { // ALI
      permitType: 'EIP2612',
      domain: {
        name: 'AliERC20v2',
        chainId: 1,
        verifyingContract: '0x6b0b3a982b4634ac68dd83a4dbf02311ce324181'
      },
  },
//   '0xfa57f00d948bb6a28072f5416fcbf7836c3d62dd': { // FRIES
//       permitType: 'EIP2612',
//       domain: {
//         name: 'FRIES',
//         version: '1',
//         chainId: 1,
//         verifyingContract: '0xfa57f00d948bb6a28072f5416fcbf7836c3d62dd'
//       },
//   },
  '0x3be5d86be59a9ccd990f054f234c02f6d0d48512': { // XPAD
      permitType: 'EIP2612',
      domain: {
        name: 'XPad',
        version: '1',
        chainId: 1,
        verifyingContract: '0x3be5d86be59a9ccd990f054f234c02f6d0d48512'
      },
  },
//   '0x7b39917f9562c8bc83c7a6c2950ff571375d505d': { // LEAG
//       permitType: 'EIP2612',
//       domain: {
//         name: 'LEAG',
//         version: '1',
//         chainId: 1,
//         verifyingContract: '0x7b39917f9562c8bc83c7a6c2950ff571375d505d'
//       },
//   },

  '0x33349b282065b0284d756f0577fb39c158f935e6': 'non-standard', // MPL - non standard, using 'amount' instead of 'value' in permit typehash:
  // {
  //     permitType: 'EIP2612',
  //     permitTypeHash: '0xfc77c2b9d30fe91687fd39abb7d16fcdfe1472d065740051ab8b13e4bf4a617f',  
  //     domain: {
  //         name: 'Maple Token',
  //         version: '1',
  //         chainId: 1,
  //         verifyingContract: '0x33349b282065b0284d756f0577fb39c158f935e6'
  //     },
  //     comment: 'Using amount insead of value in permit typehash',
  // },
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'non-standard', // AAVE - using _nonces instead of nonces
  // {
  //     permitType: 'EIP2612',
  //     domain: {
  //         name: 'Aave Token',
  //         version: '1',
  //         chainId: 1,
  //         verifyingContract: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'
  //     },
  //     comment: 'using _nonces',
  // },
  
  '0x7f0693074f8064cfbcf9fa6e5a3fa0e4f58ccccf': 'not supported', // GM - permit handles NFTs
  '0xcc7ab8d78dba187dc95bf3bb86e65e0c26d0041f': 'not supported', // SPACE - domain separator not initialized properly
  '0x6100dd79fcaa88420750dcee3f735d168abcb771': 'not supported', // OS - Ethereans - domain separator not recognized - wasn't debugged further - IGNORED
  '0xd69f306549e9d96f183b1aeca30b8f4353c2ecc3': 'not supported', // MCHC - domain typehash doesn't match domain separator (typehash doesn't include version)
  '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44': 'not supported', // KP3R - non standard encoding of typehashes ('uint' alias used)
  '0x226f7b842e0f0120b7e194d05432b3fd14773a9d': 'not supported', // UNN - contract not verified on etherscan
  '0xc5bddf9843308380375a611c18b50fb9341f502a': 'not supported', // yveCRV-DAO - non standard encoding of typehashes ('uint' alias used)
  '0x058bc8ef040bd3971418e36aa88b64899378ccf4': 'not supported', // DONA - incorrect permit function implementation (owner replaced by msg.sender)
  '0xe9f84de264e91529af07fa2c746e934397810334': 'not supported', // SAK3 - incorrect permit function implementation (owner replaced by msg.sender)
  '0x5166e09628b696285e3a151e84fb977736a83575': 'not supported', // VOL - incorrect permit function implementation (owner replaced by msg.sender)
  '0xa456b515303b2ce344e9d2601f91270f8c2fea5e': 'not supported', // CORN - non standard vyper implementation
  '0x99fe3b1391503a1bc1788051347a1324bff41452': 'not supported', // SX - non standard typehash ('holder' for 'owner')
}
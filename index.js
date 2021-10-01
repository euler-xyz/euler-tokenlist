const axios = require("axios")
const fs = require("fs")
const ethers = require("ethers")

let currentTokenList = require("./euler-tokenlist.json");


const COINGECKO_URI = "https://tokens.coingecko.com/uniswap/all.json";
const UNIV3_GRAPH_URI = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

const quoteToken = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // WETH

let schema = {
  name: "Euler Default List",
  timestamp: "",
  version: {
    major: 1,
    minor: 0,
    patch: 0
  },
  tags: {},
  logoURI: "https://www.euler.finance/static/media/EF_logo__EF_social_element_lite-bg.18ad02c6.svg",
  "keywords": [
    "euler",
    "default"
  ],
  tokens:[]
}

let coingeckoList;
let coingeckoDict = {};
let univ3List = []; 
let univ3Dict = {};
let eulerList = [];
let coingeckoAddressesL = [];
let coingeckoAddressesR = [];

let currentTokens = 0;

const uniTokenQuery = `
  query tokens($id_in: [String], $first: Int){
    tokens(where: {id_in: $id_in}, first: $first){
      id
      symbol
      name
      volumeUSD
    }
  }`

const uniLPQueryL = `
    query tokens($id_in: [String], $first: Int, $quote: String){
      pools(first:$first, where: { token0_in: $id_in, token1: $quote}){
        id
        token0{
          id
          symbol
          name
        }
        feeTier
        liquidity
      }
    }`

const uniLPQueryR = `
    query tokens($id_in: [String], $first: Int, $quote: String){
      pools(first:$first, where: { token0: $quote, token1_in: $id_in }){
        id
        token1{
          id
          symbol
          name
        }
        feeTier
        liquidity
      }
    }`



async function getCoinGeckoTokens() {
    const output = await axios.get(COINGECKO_URI)
    return output.data.tokens
}

async function getUniv3Tokens(_addresses, _first=1000, _slice=1000) {

  for (let i = 0; i < _addresses.length; i += _slice) {
    
    try{
      var _res = await axios.post(
        UNIV3_GRAPH_URI, 
        {
          query: uniTokenQuery,
          variables: {
            id_in: _addresses.slice(i, i + _slice),
            first: _first
          }
        }, 
        {
          headers: {'Content-Type': 'application/json'}
        }
      );

      univ3List = univ3List.concat(_res.data.data.tokens);
    }
    catch(error){
      console.log(error.response.data)
    }
  }
}


async function getUniv3LP(_addresses, _first, _slice, addressPosition="left") {

  console.log(_addresses.length);

  let _query = uniLPQueryL;
  if(addressPosition === "right") _query = uniLPQueryR

  for (let i = 0; i < _addresses.length; i += _slice) {
    
    try{
      var _res = await axios.post(
        UNIV3_GRAPH_URI, 
        {
          query: _query,
          variables: {
            id_in: _addresses.slice(i, i + _slice),
            first: _first,
            quote: quoteToken
          }
        }, 
        {
          headers: {'Content-Type': 'application/json'}
        }
      );

      _res.data.data.pools.forEach(LP=>{
        
        let tokenIndex = "token0"
        if(addressPosition === "right") tokenIndex="token1"

        let _tokenAddr = LP[tokenIndex]["id"];

        if(univ3Dict[_tokenAddr] === undefined)
          univ3Dict[_tokenAddr] = true
        
      });
    }
    catch(error){
      console.log(error.response.data)
    }
  }
}


function generateEulerTokenList() {

  coingeckoList.forEach(coin => {
    if(univ3Dict[coin.address])
      currentTokenList.tokens.push(coin);
  })

  console.log("eulerList: "+currentTokenList.tokens.length);
  
  if(currentTokenList.tokens.length > currentTokens){
    currentTokenList.version.minor += 1
    currentTokenList.timestamp = new Date().toISOString();
  }

  fs.writeFileSync("./euler-tokenlist.json", JSON.stringify(currentTokenList, null, 4));
}


async function getTokens() {

  currentTokens = currentTokenList.tokens.length;
  currentTokenList.tokens = [];

  coingeckoList = await getCoinGeckoTokens();

  console.log("coingeckoList: "+coingeckoList.length)

  //Consider Token Addresses Greater than WETH
  coingeckoList.forEach(_token => {
    if(!ethers.BigNumber.from(_token.address).gt(quoteToken))
      coingeckoAddressesL.push(_token.address);
    else
      coingeckoAddressesR.push(_token.address);
  });

  await getUniv3LP(coingeckoAddressesL, 1000, 300, "left");
  await getUniv3LP(coingeckoAddressesR, 1000, 300, "right");
  
  
  console.log("univ3total: "+ Object.keys(univ3Dict).length);

  generateEulerTokenList();
}


getTokens();

const { ethers, constants } = require('ethers');

const MARKETS_ABI = [
    'function underlyingToEToken(address underlying) view returns (address)',
];
const MARKETS_ADDRESS = '0x3520d5a913427E6F0D6A83E07ccD4A4da316e4d3';
const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC_URL);
const marketsContract = new ethers.Contract(
    MARKETS_ADDRESS,
    MARKETS_ABI,
    provider,
);

const isEulerMarket = async tokenAddress => {
    const eTokenAddress = await marketsContract.underlyingToEToken(tokenAddress);
    return eTokenAddress !== constants.AddressZero;
}

module.exports = {
    isEulerMarket,
};

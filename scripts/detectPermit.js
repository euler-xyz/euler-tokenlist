const PermitDetector = require('./lib/PermitDetector');
const curatedList = require('../curated/permits');
const CHAIN_ID = process.env.CHAIN_ID || 1;
const MULTICALL2_ADDRESS = process.env.MULTICALL2_ADDRESS || '0x5ba1e12693dc8f9c48aad8770482f4739beed696';

const run = async () => {
    const token = process.argv[2];
    if (!token) {
        console.log('No token address provided. See README');
        return;
    }
    const pertmitDetector = new PermitDetector(CHAIN_ID, MULTICALL2_ADDRESS);
    const result = await pertmitDetector.detectToken(token, curatedList); 

    if (result.permitType) {
        console.log("DETECTED:", result.permitType, result.variant || '');
        console.log(result.domain);
    } else if (!result.domainSeparator && !result.typeHash && !result.unexpectedError) {
        console.log("No permit support detected");
        console.log(result);
    } else {
        console.log("ERROR");
        console.log(result);
    }
};

run().then(() => process.exit());

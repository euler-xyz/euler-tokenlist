const axios = require('axios');
const fs = require('fs');
const PermitDetector = require('./lib/PermitDetector');
const curatedList = require('../curated/permits');

const CHAIN_ID = process.env.CHAIN_ID || 1;
const MULTICALL2_ADDRESS = process.env.MULTICALL2_ADDRESS || '0x5ba1e12693dc8f9c48aad8770482f4739beed696';

const { BigNumber } = require('ethers')

const run = async () => {
    const tokenListUrl = process.argv[2];
    const filePath = process.argv[3];

    if (!tokenListUrl || !filePath) {
        console.log('Missing parameters. See README');
        return;
    }

    const errorsPath = './detect-permit-errors.log';
    const batchSize = process.env.DETECT_PERMIT_BATCH_SIZE || 20;
    const currentList = fs.existsSync(filePath) ? require(`../${filePath}`) : { tokens: [] };

    const { data: tokenList } = await axios.get(tokenListUrl);

    const permitDetector = new PermitDetector(CHAIN_ID, MULTICALL2_ADDRESS, console);
    const { counts, processedList, errors } = await permitDetector.detectList(curatedList, currentList, tokenList, batchSize);

    fs.writeFileSync(filePath, JSON.stringify(processedList, null, 2));
    if (errors.length) fs.writeFileSync(errorsPath, JSON.stringify(errors, null, 2));

    console.log("DETECTED TOTAL:", counts.yes);
    console.log("NO SUPPORT TOTAL:", counts.no);
    console.log("ERRORS TOTAL:", counts.error);
};

run().then(() => process.exit());

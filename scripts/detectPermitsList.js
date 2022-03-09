const axios = require('axios');
const fs = require('fs');
const PermitDetector = require('./lib/PermitDetector');
const curatedList = require('../curated/permits');

const CHAIN_ID = process.env.CHAIN_ID || 1;

const { BigNumber } = require('ethers')

const run = async () => {
    const tokenListUrl = process.argv[2];
    const filePath = process.argv[3];

    if (!tokenListUrl || !filePath) {
        console.log('Missing parameters. See README');
        return;
    }

    console.log(BigNumber.from('0xc18360217d8f7ab5e7c516566761ea12ce7f9d72').gt('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'));
    const errorsPath = './detect-permit-errors.log';
    const batchSize = process.env.DETECT_PERMIT_BATCH_SIZE || 20;
    const currentList = fs.existsSync(filePath) ? require(`../${filePath}`) : { tokens: [] };

    const { data: tokenList } = await axios.get(tokenListUrl);

    const permitDetector = new PermitDetector(CHAIN_ID, true);
    const { counts, processedList, errors } = await permitDetector.detectList(curatedList, currentList, tokenList, batchSize);

    fs.writeFileSync(filePath, JSON.stringify(processedList, null, 2));
    if (errors.length) fs.writeFileSync(errorsPath, JSON.stringify(errors, null, 2));

    console.log("DETECTED TOTAL:", counts.yes);
    console.log("NO SUPPORT TOTAL:", counts.no);
    console.log("ERRORS TOTAL:", counts.error);
};

run().then(() => process.exit());

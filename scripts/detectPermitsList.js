const axios = require('axios');
const PermitDetector = require('./permitsLib');
const curatedList = require('../curated/permits');

const run = async () => {
    const tokenListUrl = process.argv[2];
    const filePath = process.argv[3];
    if (!tokenListUrl || !filePath) {
        console.log('Missing parameters. See README');
        return;
    }
    const { data: tokenList } = await axios.get(tokenListUrl);

    const batchSize = process.env.DETECT_PERMIT_BATCH_SIZE || 20;

    const permitDetector = new PermitDetector();
    const counts = await permitDetector.detectList(curatedList, tokenList, filePath, batchSize);

    console.log("DETECTED TOTAL:", counts.yes);
    console.log("NO SUPPORT TOTAL:", counts.no);
    console.log("ERRORS TOTAL:", counts.error);
};

run().then(() => process.exit());

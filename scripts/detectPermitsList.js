const axios = require('axios');
const { detectList } = require('./permitsLib');

const run = async () => {
    const tokenListUrl = process.argv[2];
    const filePath = process.argv[3];
    if (!tokenListUrl || !filePath) {
        console.log('Missing parameters. See README');
        return;
    }
    const { data: tokenList } = await axios.get(tokenListUrl);

    const batchSize = process.env.DETECT_PERMIT_BATCH_SIZE || 20;

    await detectList(tokenList, filePath, batchSize); 
};

run().then(() => process.exit());

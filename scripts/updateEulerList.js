const axios = require('axios');
const fs = require('fs');

const PermitDetector = require('./lib/PermitDetector');
const { getExistingUniPools } = require('./lib/uniPools');
const { isEulerMarket } = require('./lib/euler');
const { sendAlert, alertRun } = require('./lib/discord');
const { initRepo, commitRepo } = require('./git')
const { WETH_ADDRESS } = require('./lib/constants');

const CHAIN_ID = process.env.CHAIN_ID || 1;
const detectPermitErrorsPath = './detect-permit-errors.log';
const batchSize = process.env.DETECT_PERMIT_BATCH_SIZE || 20;

const processedListFileName = process.env.PROCESSED_LIST_FILE_NAME || 'coingecko-with-permits-tokenlist.json';
const currentList = require(`../${processedListFileName}`);

const eulerListPath = `${__dirname}/../euler-tokenlist.json`;
const eulerList = require(eulerListPath);

const curatedRemoved = require('../curated/remove');
const curatedAdded = require('../curated/add');
const curatedPermits = require('../curated/permits');
const { isEqual } = require('lodash');


const isInList = (token, list) => list.some(t => t.address === token.address);
const describeToken = token => `${token.address}, ${token.symbol}, ${token.name}`;
const prettyJson = o => JSON.stringify(o, null, 2);
const sortBySymbol = list => list.sort((a, b) => a.symbol.localeCompare(b.symbol));

const run = async () => {
    
    if (!process.env.TOKENLIST_URL) {
        console.log('Missing token list url in env');
        process.exit(1);
    }
    try {
        const logs = [];
        const tokenListCounts = {
            added: 0,
            removed: 0,
            updated: 0,
        };

        // Clean repo and fetch latest list
        await initRepo()
        
        const { data: newList }  = await axios.get(process.env.TOKENLIST_URL);

        // Detect permits and update processed full list

        // const permitDetector = new PermitDetector(CHAIN_ID, true);
        // let { counts: permitCounts, processedList, errors } = await permitDetector.detectList(curatedPermits, currentList, newList, batchSize);

        // fs.writeFileSync(`${__dirname}/../${processedListFileName}`, prettyJson(processedList));
        // if (errors.length) {
        //     fs.writeFileSync(detectPermitErrorsPath, prettyJson(errors));
        //     logs.push('DETECT PERMIT ERRORS', prettyJson(errors));
        // }
        let permitCounts = {yes: 2, no: 30, error: 0}
        let processedList = currentList;
        // Handle removed tokens

        eulerList.tokens = await Promise.all(eulerList.tokens.map(async et => {
            if (!isInList(et, processedList.tokens)) {
                const symbolMatch = processedList.tokens.find(t => t.symbol === et.symbol);
                if (await isEulerMarket(et.address)) {
                    if (symbolMatch) {
                        logs.push(`REVIEW REMOVED ${describeToken(et)} POSSIBLE UPGRADE TO ${describeToken(symbolMatch)}`);
                    } else {
                        logs.push(`REVIEW REMOVED ${describeToken(et)}`);
                    }
                    return et;
                } else {
                    // logs.push(`REMOVED ${describeToken(et)}`);
                    tokenListCounts.removed++;
                    return null;
                }
            }
            return et;
        }));
        // filter out removed
        eulerList.tokens = eulerList.tokens.filter(Boolean);

        // Update existing tokens

        eulerList.tokens = await Promise.all(eulerList.tokens.map(async et => {
            const newToken = processedList.tokens.find(t => t.address === et.address);
            if (!newToken) return et; // from curated added

            if (et.decimals !== newToken.decimals && await isEulerMarket(et.address)) {
                logs.push(`REVIEW UPDATED DECIMALS ${JSON.stringify(et)} TO ${JSON.stringify(newToken)}`);
            }
            if (!isEqual(newToken, et)) tokenListCounts.updated++;

            return newToken
        }));

        // Add new tokens

        const poolExists = await getExistingUniPools(processedList.tokens);
        processedList.tokens
            .filter(t => poolExists[t.address])
            .forEach(t => {
                if (!isInList(t, eulerList.tokens) && !isInList(t, curatedRemoved)) {
                    eulerList.tokens.push(t);
                    // logs.push(`ADDED ${describeToken(t)}`);
                    tokenListCounts.added++;
                }
            });

        // Apply curated changes

        curatedAdded.forEach(ct => {
            if (!isInList(ct, eulerList.tokens)) {
                eulerList.tokens.push(ct);
            } else {
                logs.push(`REVIEW READDED ${describeToken(ct)}`)
            }
        })
        eulerList.tokens = eulerList.tokens.filter(et => !isInList(et, curatedRemoved));

        // Sort for cleaner diffs and save the updated list

        eulerList.tokens = sortBySymbol(eulerList.tokens);
        fs.writeFileSync(eulerListPath, prettyJson(eulerList));

        fs.writeFileSync('./logs', prettyJson(logs));

        // Push changes and report

        eulerList.version.minor++;
        eulerList.timestamp = new Date().toISOString();
        await commitRepo();

        await alertRun(logs, permitCounts, tokenListCounts);
    } catch (e) {
        console.log('e: ', e);
        await sendAlert(e.message);
    }
};

run().then(() => process.exit());

const axios = require('axios');
const { chunk } = require('lodash');
const { WETH_ADDRESS } = require('./constants');
const UNIV3_GRAPH_URI = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 100;
const poolQuery = `
    query pools($tokens: [Bytes]!, $reference: String!) {
        as0: pools(first: 1000, where: { token0_in: $tokens, token1: $reference }, subgraphError: allow) {
            token0 {
                id
            }
        }
        as1: pools(first: 1000, where: { token1_in: $tokens, token0: $reference }, subgraphError: allow) {
            token1 {
                id
            }
        }
    }
`

const getExistingUniPools = async tokens => {
    const poolExists = {};

    for (let batch of chunk(tokens, BATCH_SIZE)) {
        const res = await axios.post(
            UNIV3_GRAPH_URI, 
            {
                query: poolQuery,
                variables: {
                    tokens: batch.map(t => t.address),
                    reference: WETH_ADDRESS,
                }
            }, 
            {
                headers: {'Content-Type': 'application/json'}
            },
        );
        res.data.data.as0.forEach(p => {
            poolExists[p.token0.id] = true;
        });
        res.data.data.as1.forEach(p => {
            poolExists[p.token1.id] = true;
        });
    }
    return poolExists;
}

module.exports = {
    getExistingUniPools,
};

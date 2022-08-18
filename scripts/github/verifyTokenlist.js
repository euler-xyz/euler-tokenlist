const util = require('util');
const fs = require('fs');
const { isEqual } = require('lodash');
const exec = util.promisify(require('child_process').exec);
const { isEulerMarket } = require('../lib/euler');
const { sendAlert } = require('../lib/discord');

const isInList = (token, list) => list.some(t => t.address.toLowerCase() === token.address.toLowerCase());
const describeToken = token => `${token.address}, ${token.symbol}, ${token.name}`;

const run = async () => {
  try {
    const oldList = require('../../euler-tokenlist.json');

    // WARNING: checking out incoming branch in an action triggered by pull_request_target is potentially a security issue
    // make sure to switch branches back and disable hooks with -c core.hooksPath=/dev/null
    // https://securitylab.github.com/research/github-actions-preventing-pwn-requests/
    await exec(`git -c core.hooksPath=/dev/null checkout ${process.env.HEAD_REF}`);

    const newList = JSON.parse(fs.readFileSync(`${__dirname}/../../euler-tokenlist.json`, { encoding: 'utf8' }));

    await exec(`git -c core.hooksPath=/dev/null checkout ${process.env.BASE_REF}`);


    // Check for duplicates

    newList.tokens.forEach(nt => {
      const addressMatch = newList.tokens.filter(t => nt.address.toLowerCase() === t.address.toLowerCase());
      if (addressMatch.length > 1) {
          throw new Error(`Duplicate address: ${nt.address}`);
      }
    })

    // Check for removed or updated activated markets

    await Promise.all(oldList.tokens.map(async t => {
      if (!isInList(t, newList.tokens) && await isEulerMarket(t.address)) {
        throw new Error(`Bot tries to remove an activated market: ${describeToken(t)}`);
      }

      const newToken = newList.tokens.find(nt => nt.address.toLowerCase() === t.address.toLowerCase());
      if (!isEqual(newToken, t) && await isEulerMarket(t.address)) {
        throw new Error(`Bot tries to modify an activated market ${describeToken(t)}`);
      }
    }));
  } catch (e) {
    console.log('error: ', e);
    await sendAlert(`@here BOT VERIFICATION: ${e.message}`);
    process.exit(1);
  }
};


run();
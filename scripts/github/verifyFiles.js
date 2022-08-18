const { sendAlert } = require('../lib/discord');

const allowed = [
  'euler-tokenlist.json',
  'coingecko-tokenlist-with-permits.json',
];

const run = async () => {
  const unallowed = process.argv.slice(2).filter(f => !allowed.includes(f));

  if (unallowed.length) {
    console.log('Attempt to modify unallowed: ', unallowed);

    await sendAlert(`@here CRITICAL! Bot attempts to modify ${unallowed.length} unallowed files`);
    process.exit(1);
  }
};

run();
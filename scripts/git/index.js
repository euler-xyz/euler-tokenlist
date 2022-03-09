const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);

const commitScript = `${__dirname}/commit.sh`
const initScript = `${__dirname}/init.sh`;

const initRepo = async () => {
  fs.chmodSync(initScript, "755");
  await exec(initScript);
}

const commitRepo = async () => {
  fs.chmodSync(commitScript, "755");
  await exec(commitScript);
}

module.exports = {
  initRepo,
  commitRepo,
}
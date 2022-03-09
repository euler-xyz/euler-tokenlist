const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);

const commitScript = `${__dirname}/commit.sh`
const initScript = `${__dirname}/init.sh`;

const initRepo = async () => {
  fs.chmodSync(initScript, fs.constants.X_OK);
  await exec(initScript);
}

const commitRepo = async () => {
  fs.chmodSync(commitScript, fs.constants.X_OK);
  await exec(commitScript);
}

module.exports = {
  initRepo,
  commitRepo,
}
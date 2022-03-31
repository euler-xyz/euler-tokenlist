const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

winston.add(
  new WinstonCloudWatch({
    logGroupName: process.env.CLOUDWATCH_LOG_GROUP,
    logStreamName: process.env.CLOUDWATCH_LOG_STREAM,
    awsRegion: process.env.AWS_REGION,
    jsonMessage: true,
  }),
);

class Logger {
  constructor(script, console = true) {
    this.script = script;
    this.console = console;
  }
  log(msg) {
    winston.log("info", msg, { script: this.script });
    if (this.console) console.log(msg);
  }
  error(e) {
    winston.log("error", e, { script: this.script });
    if (this.console) console.log(e);
  }
}

module.exports = Logger;

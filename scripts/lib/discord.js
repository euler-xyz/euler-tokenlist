const { Webhook } = require('discord-webhook-node');
const hookUrl = process.env.DISCORD_HOOK_URL;

const IMAGE_URL = 'https://www.euler.finance/static/media/EF_logo__Euler_finance_euler-bg.2fc2705c.svg';

const sendAlert = (alert) => {
  if (!hookUrl) return
  const hook = new Webhook(hookUrl);
  hook.setUsername('Euler Scripts BOT');
  hook.setAvatar(IMAGE_URL);
  return hook.send(alert);
}

const alertRun = (logs, permitCounts, tokenListCounts) => 
  sendAlert(
`\`\`\`
Tokenlist report ${new Date().toISOString()}
TOKENS: ${tokenListCounts.added} ADDED, ${tokenListCounts.removed} REMOVED, ${tokenListCounts.updated} UPDATED
PERMITS: ${permitCounts.yes} DETECTED, ${permitCounts.no} NOT DETECTED, ${permitCounts.error} ERRORS
LOGS: ${JSON.stringify(logs, null, 2)}
\`\`\``
);

module.exports = {
  sendAlert,
  alertRun,
}
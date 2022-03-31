module.exports = {
  apps: [
    {
      name: "update-euler-tokenlist",
      script: "./scripts/updateEulerList.js",
      watch: false,
      autorestart: false,
      cron_restart: "0 22 * * *", // every day at 10pm
    },
  ],
};

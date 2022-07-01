const axios = require("axios");
const { merge } = require("lodash");

const COINS_LIST_URL =
  "https://api.coingecko.com/api/v3/coins/list?include_platform=true";
const marketURL = (marketId) =>
  `https://api.coingecko.com/api/v3/coins/${marketId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`;

const addProjectData = async (tokens) => {
  let coinsList;
  try {
    coinsList = (await axios.get(COINS_LIST_URL)).data;
  } catch (e) {
    console.log("Error fetching coinlist from Coingecko", e);
    return tokens;
  }
  const fetchMarket = async (token) => {
    let market = coinsList.find(
      (c) => c.platforms && c.platforms.ethereum === token.address
    );

    if (
      !market ||
      (token.extensions &&
        token.extensions.project &&
        token.extensions.project.homepage)
    )
      return;

    return (await axios.get(marketURL(market.id))).data;
  };

  for (const token of tokens) {
    let market;
    try {
      market = await fetchMarket(token);
    } catch (e) {
      if (e.response && e.response.headers["retry-after"]) {
        await new Promise((r) => {
          setTimeout(r, e.response.headers["retry-after"] * 1000 + 2000);
        });
        try {
          market = await fetchMarket(token);
        } catch {} // we'll try tomorrow
      } else {
        console.log(e);
      }
    }

    if (market && market.links && market.links.homepage) {
      merge(token, {
        extensions: { project: { homepage: market.links.homepage } },
      });

      await new Promise((r) => {
        setTimeout(r, 500);
      });
    }
  }
};

module.exports = addProjectData;

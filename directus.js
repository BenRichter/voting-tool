const DirectusSDK = require('directus-sdk-javascript/remote');
require('dotenv').config();

const client = new DirectusSDK({
  url: process.env.DIRECTUS_URL,
  accessToken: process.env.DIRECTUS_ACCESS_TOKEN
});

module.exports = client;

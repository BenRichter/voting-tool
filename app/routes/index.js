const router = require('express').Router();

const auth = require('./auth');
const request = require('./request');
const vote = require('./vote');
const comment = require('./comment');

const directus = require('../directus');
const {parseDate, dateToString, parseRequestData} = require('../utils');

const renderHomepage = (req, res) => {
  const loggedIn = req.user && req.user.length > 0;

  directus.getItems('requests', {
    depth: 1
  })
    .then(({data}) => data.map(parseRequestData))
    .then(requests => res.render('index', {loggedIn, requests}))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
};

module.exports = router
  .use('/auth', auth)
  .use('/vote', vote)
  .get('/', renderHomepage)
  .use('/comment', comment)
  .use('/r/', request);

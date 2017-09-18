const router = require('express').Router();

const auth = require('./auth');
const request = require('./request');
const vote = require('./vote');
const comment = require('./comment');

const directus = require('../directus');
const { parseDate, dateToString, parseRequestData } = require('../utils');

const renderHomepage = (req, res) => {
  const username = req.user;
  const loggedIn = username && username.length > 0;

  directus
    .getItems('requests', {
      depth: 1,
      status: 1
    })
    .then(({ data }) => data.filter(request => request.active === 1))
    .then(requests =>
      requests.map(request => parseRequestData(request, username))
    )
    .then(requests => requests.sort((a, b) => (a.score < b.score ? 1 : -1)))
    .then(requests => res.render('index', { loggedIn, requests }))
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

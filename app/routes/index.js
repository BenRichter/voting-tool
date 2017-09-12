const router = require('express').Router();

const auth = require('./auth');
const request = require('./request');
const vote = require('./vote');
const comment = require('./comment');

const directus = require('../directus');

const renderHomepage = (req, res) => {
  directus.getItems('requests')
    .then(({data: requests}) => res.render('index', {user: req.user, requests}))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
};

module.exports = router
  .use('/auth', auth)
  .use('/vote', vote)
  .use('/comment', comment)
  .get('/', renderHomepage)
  .use('/r/', request);

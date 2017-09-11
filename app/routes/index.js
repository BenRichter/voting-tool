const router = require('express').Router();

const auth = require('./auth');

const renderHomepage = (req, res) => res.render('index', {user: req.user});

module.exports = router
  .use('/auth', auth)
  .get('/', renderHomepage);

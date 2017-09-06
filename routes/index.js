const router = require('express').Router();

router
  .use('/auth', require('./auth'))
  .get('/', (req, res) => res.render('index', {user: req.user}));

module.exports = router;

const router = require('express').Router();
const client = require('../directus');

router
  .use('/auth', require('./auth'))
  .get('/', sendHome)
  .all('*', send404);

function sendHome(req, res) {
  client
    .getItems('requests', {
      limit: 10,
      'order[votes]': 'DESC',
      status: 1
    })
    .then(({data}) => {
      res.render('index', {
        user: req.user,
        requests: data
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
}

function send404(req, res) {
  res.status(404).render('404');
}

module.exports = router;

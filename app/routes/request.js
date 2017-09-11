const router = require('express').Router();

const directus = require('../directus');

const renderRequest = (req, res) => {
  directus.getItem('requests', req.params.id)
    .then(({data: request}) => res.render('request', {request}))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
};

module.exports = router
  .get('/:id', renderRequest);

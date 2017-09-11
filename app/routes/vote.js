const router = require('express').Router();

const directus = require('../directus');

const vote = (req, res) => {
  const {request_id, action} = req.body;

  console.log(req.body);

  res.redirect('/r/' + request_id);
};

module.exports = router
  .post('/', vote);

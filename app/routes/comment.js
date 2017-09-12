const router = require('express').Router();

const directus = require('../directus');

const placeComment = (req, res) => {
  const {request_id, content} = req.body;
  const userID = req.user.id;

  // If user isn't logged in, redirect back
  if (!req.user) return res.redirect('/r/' + request_id);

  directus.createItem('comments', {
    user_id: userID,
    request_id,
    content,
    date: new Date().toISOString().slice(0, 10),
    active: 1
  })
    .then(() => res.redirect('/r/' + request_id))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
};

module.exports = router
  .post('/', placeComment);

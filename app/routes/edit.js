const router = require('express').Router();
const directus = require('../directus');

const updateComment = (req, res) => {
  const {request_id, comment_id, content} = req.body;

  // If user isn't logged in, redirect back
  if (!req.user) res.redirect('/r/' + request_id);

  // Fetch comment to check if current user is comment's owner
  directus.getItem('comments', comment_id)
    .then(({data}) => {
      if (req.user.id === data.user_id.data.id) {
        return directus.updateItem('comments', comment_id, {
          last_updated: new Date().toISOString().slice(0, 10),
          content
        })
      }
    })
    .then(() => res.redirect('/r/' + request_id))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    })
};

const updateRequestTitle = (req, res) => {
  const {request_id, title} = req.body;

  // If user isn't logged in, redirect back
  if (!req.user) res.redirect('/r/' + request_id);

  // Fetch request to check if current user is request's owner
  directus.getItem('requests', request_id)
    .then(({data}) => {
      if (req.user.id === data.user.data.id) {
        return directus.updateItem('requests', request_id, {
          last_updated: new Date().toISOString().slice(0, 10),
          title
        })
      }
    })
    .then(() => res.redirect('/r/' + request_id))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    })
};

module.exports = router
  .post('/comment', updateComment)
  .post('/title', updateRequestTitle);

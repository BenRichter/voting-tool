const router = require('express').Router();
const timeago = require('timeago.js');
const marked = require('marked');

const directus = require('../directus');

const parseRequestData = request => ({
  id: request.id,
  title: request.title,
  votes: request.votes_offset + request.voted_on_by.data.length,
  username: request.user.data.username,
  closed: Boolean(request.closed),
  date: new Date(...request.date.split('-')),
  date_relative: timeago().format(new Date(...request.date.split('-'))),
  comments: request.comments.data
    .filter(comment => comment.active === 1)
    .map(comment => ({
      content: marked(comment.content),
      username: comment.user_id,
      date_relative: timeago().format(new Date(...comment.date.split('-'))),
    }))
});

const renderRequest = (req, res) => {
  directus.getItem('requests', req.params.id)
    // .then(({data: request}) => request)
    .then(({data: request}) => parseRequestData(request))
    .then(request => res.render('request', {request}))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
};

module.exports = router
  .get('/:id', renderRequest);

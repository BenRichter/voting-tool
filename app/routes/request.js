const router = require('express').Router();
const timeago = require('timeago.js');
const marked = require('marked');

const directus = require('../directus');

const parseRequestData = (request, user) => ({
  id: request.id,
  title: request.title,
  votes: request.votes_offset + request.voted_on_by.data.length,
  username: request.user.data.username,
  user_id: request.user.data.id,
  closed: Boolean(request.closed),
  date: new Date(...request.date.split('-')),
  date_relative: timeago().format(new Date(...request.date.split('-'))),
  edit_allowed: request.user.data.id === user.id,
  comments: request.comments.data
    .filter(comment => comment.active === 1)
    .map(comment => ({
      content_parsed: marked(comment.content),
      content: comment.content,

      // Bug: directus/directus#1806
      // username: comment.user.data.username,
      // user_id: comment.user.data.id,

      username: comment.user_id,
      user_id: comment.user_id,

      // edit_allowed: comment.user_id === user.id,
      edit_allowed: comment.user_id === user.id,

      id: comment.id,
      date_relative: timeago().format(new Date(...comment.date.split('-'))),
      edited: Boolean(comment.last_updated && comment.date !== comment.last_updated),
      date: comment.date,
      last_updated: comment.last_updated
    }))
});

const renderRequest = (req, res) => {
  directus.getItem('requests', req.params.id)
    // .then(({data: request}) => request)
    .then(({data: request}) => ({request: parseRequestData(request, req.user)}))
    .then(locals => {
      locals.edit_mode = Boolean(req.query.edit);
      return locals;
    })
    .then(locals => res.render('request', locals))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
};

module.exports = router
  .get('/:id', renderRequest);

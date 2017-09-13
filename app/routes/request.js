const router = require('express').Router();
const marked = require('marked');
const dateToRelative = require('timeago.js')().format;

const directus = require('../directus');

/**
 * Parses a mysql date [YYYY-MM-DD HH:MM:SS] to a JS Date object
 * @param  {String} dateString YYYY-MM-DD HH:MM:SS
 * @return {Date}              JS Date object
 */
const parseDate = dateString => {
  const parts = dateString.split(/[- :]/);
  parts[1] = parts[1] - 1;
  return new Date(...parts);
};

/**
 * Parses a single request down to a usable data object to be rendered
 * Adds in an editAllowed flag, relative dates, and parsed markdown content
 * @param  {Object} request  Single request object from Directus
 * @param  {String} username Logged in user
 * @return {Object}          Single request object parsed
 */
const parseRequestData = (request, username) => {
  const editAllowed = (request.username === username);

  const date = parseDate(request.date);
  const dateRelative = dateToRelative(date);

  const votes = request.votes.data;
  const upvotes = votes.filter(vote => vote.value === 1);
  const downvotes = votes.filter(vote => vote.value === -1);

  const upvotesCount = upvotes.length + request.votes_offset;
  const downvotesCount = downvotes.length;

  // Object {[username]: vote} to later match comments against
  const userVotes = {};
  votes.forEach(({username, value}) => (userVotes[username] = value));

  const comments = request.comments.data
    .map(comment => {
      const editAllowed = (comment.username === username);

      const content = marked(comment.content);
      const date = parseDate(comment.date);
      const dateRelative = dateToRelative(date);

      // Either -1, 1 or
      const userVoted = userVotes[comment.username] || null;

      return {
        id: comment.id,
        username: comment.username,
        content,
        userVoted,
        date,
        dateRelative,
        editAllowed
      }
    });

  const result = {
    id: request.id,
    username: request.username,
    date,
    dateRelative,
    editAllowed,
    upvotesCount,
    downvotesCount,
    comments
  }

  return result;
}

const renderRequest = (req, res) => {
  const id = req.params.id;
  const username = req.user;

  directus
    .getItem('requests', id)
    .then(response => response.data)
    .then(data => parseRequestData(data, username))
    .then(request => res.render('request', {request}))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
};

module.exports = router
  .get('/:id', renderRequest);

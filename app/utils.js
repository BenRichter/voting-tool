const marked = require('marked');
const dateToRelative = require('timeago.js')().format;

const adminUsers = require('./admin-users.json');

marked.setOptions({
  gfm: true,
  sanitize: true
});

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
 * Converts a JS date object to YYYY-MM-DD HH:MM:SS string
 * @param  {Date} dateObj
 * @return {String}
 */
const dateToString = dateObj =>
  `${dateObj.getFullYear()}-${dateObj.getMonth() +
    1}-${dateObj.getDate()} ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;

/**
 * Parses a single request down to a usable data object to be rendered
 * Adds in an editAllowed flag, relative dates, and parsed markdown content
 * @param  {Object} request  Single request object from Directus
 * @param  {String} username Logged in user
 * @return {Object}          Single request object parsed
 */
const parseRequestData = (request, username) => {
  const editAllowed = request.username === username;

  const date = parseDate(request.date);
  const dateRelative = dateToRelative(date);

  const votes = request.votes.data.filter(vote => vote.active === 1);
  const upvotes = votes.filter(vote => vote.value === 1);
  const downvotes = votes.filter(vote => vote.value === -1);

  const upvotesCount = upvotes.length + request.votes_offset;
  const downvotesCount = downvotes.length;

  const edited = request.last_updated && request.last_updated !== request.date;

  // Object {[username]: vote} to later match comments against
  const userVotes = {};
  votes.forEach(({ username, value }) => (userVotes[username] = value));

  const getUserVote = username => {
    const value = userVotes[username];
    if (value)
      return value === 1 ? 'voted up' : 'voted down';
    else return false;
  };

  const userVoted = userVotes[username] || false;

  const comments = request.comments.data
    .filter(comment => comment.active === 1)
    .map(comment => {
      const editAllowed = comment.username === username;

      const content = comment.content;
      const contentParsed = marked(content);
      const date = parseDate(comment.date);
      const dateRelative = dateToRelative(date);

      const edited =
        comment.last_updated && comment.last_updated !== comment.date;

      const userHasVoted = userVotes.hasOwnProperty(comment.username);
      let userVote = userHasVoted ? getUserVote(comment.username) : null;

      const userIsAdmin = adminUsers.includes(comment.username);

      return {
        id: comment.id,
        username: comment.username,
        content,
        contentParsed,
        edited,
        userVote,
        date,
        dateRelative,
        editAllowed,
        userIsAdmin
      };
    });

  const result = {
    id: request.id,
    username: request.username,
    title: request.title,
    date,
    dateRelative,
    userVoted,
    editAllowed,
    edited,
    upvotesCount,
    downvotesCount,
    score: upvotesCount - downvotesCount,
    comments
  };

  return result;
};

/**
 * Express middleware which redirects to the homepage if the user isn't logged in
 */
const noAuthNoPlay = (req, res, next) => {
  if (!req.user) return res.redirect('/');
  return next();
};

module.exports = { parseDate, dateToString, parseRequestData, noAuthNoPlay };

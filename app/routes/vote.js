const router = require('express').Router();

const directus = require('../directus');
const passport = require('../passport');
const db = require('../db');

const hasUserVotedAlready = (userID, requestID) => {
  userID = Number(userID);
  requestID = Number(requestID);

  return new Promise((resolve, reject) => {
    // Get most up-to-date vote records, to prevent the user from voting at the
    //   same time from multiple browser windows
    directus.getItems('voted_on', {
      'in[gh_user_id]': userID
    })
      .then(({data}) => data.map(obj => obj.request_id))
      .then(ids => resolve(ids.includes(requestID)))
      .catch(reject);
  });
}

const voteMinus = async (req, res) => {
  const requestID = req.body.request_id;
  const userID = req.user.id;
  const username = req.user.username;

  // If user hasn't voted for this item, redirect back without doing anything
  if (await hasUserVotedAlready(userID, requestID) === false) {
    return res.redirect('/r/' + requestID);
  }

  // Delete junction table record
  directus.findAndDeleteItem('voted_on', {
    'in[gh_user_id]': userID,
    'in[request_id]': requestID
  })
    // Get updated user profile
    .then(() => directus.getItem('gh_users', userID))
    .then(({data: userProfile}) => db.put(username, JSON.stringify(userProfile)))
    .then(() => res.redirect('/r/' + requestID))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
}

const votePlus = async (req, res) => {
  const requestID = req.body.request_id;
  const userID = req.user.id;
  const username = req.user.username;

  // If user has voted already, redirect back without doing anything
  if (await hasUserVotedAlready(userID, requestID)) return res.redirect('/r/' + requestID);

  // Create Directus voted_on junction table item
  directus.createItem('voted_on', {
    gh_user_id: userID,
    request_id: requestID
  })
    // Get updated user profile
    .then(() => directus.getItem('gh_users', userID))
    .then(({data: userProfile}) => db.put(username, JSON.stringify(userProfile)))
    .then(() => res.redirect('/r/' + requestID))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
}

const vote = (req, res) => {
  const {request_id, action} = req.body;

  // If no user session, redirect back to the page without doing anything else
  if (!req.user) return res.redirect('/r/' + request_id);

  if (req.body.action === 'minus') return voteMinus(req, res);

  return votePlus(req, res);
};

module.exports = router
  .post('/', vote);

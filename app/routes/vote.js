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

const voteMinus = (req, res) => { res.redirect('/'); }
const votePlus = (req, res) => { res.redirect('/'); }

const vote = (req, res) => {
  const {request_id, action} = req.body;

  if (!req.user) return res.redirect('/r/' + request_id);

  if (req.body.action === 'minus') return voteMinus(req, res);

  return votePlus(req, res);
};

module.exports = router
  .post('/', vote);

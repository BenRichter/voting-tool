const router = require('express').Router();
const passport = require('passport');

router
  .get('/', passport.authenticate('github', { scope: [ 'user:email' ] }), (req, res) => res.redirect('/'))
  .get('/callback', passport.authenticate('github', { failureRedirect: '/login' }), onLoginSuccess);

function onLoginSuccess(req, res) {
  res.redirect('/');
}

module.exports = router;

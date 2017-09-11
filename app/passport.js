/**
 * Main setup file for Passport middleware
 *
 * Handles login flow and saves user sessions to local DB
 */

const passport = require('passport');
const GithubStrategy = require('passport-github2').Strategy;

require('dotenv').config();

const db = require('./db');

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);
passport.use(new GithubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, onGitHubLogin));

module.exports = passport;

function serializeUser(profile, done) {
  return done(null, profile.login);
}

function deserializeUser(id, done) {
  db.get(id)
    .then(user => done(null, JSON.parse(user)))
    .catch(done);
}

function onGitHubLogin(accessToken, refreshToken, profile, done) {
  profile = profile._json;
  db.put(profile.login, JSON.stringify(profile), err => {
    if (err) return done(err);
    return done(null, profile);
  });
}

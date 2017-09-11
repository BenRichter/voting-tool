/**
 * Main setup file for Passport middleware
 *
 * Handles login flow and saves user sessions to local DB
 */

const passport = require('passport');
const GithubStrategy = require('passport-github2').Strategy;

require('dotenv').config();

const db = require('./db');

const directus = require('./directus');

const serializeUser = (profile, done) => done(null, profile.username);

const deserializeUser = (username, done) => {
  db.get(username)
    .then(user => done(null, JSON.parse(user)))
    .catch(done);
};

const onGitHubLogin = (accessToken, refreshToken, profile, done) => {
  profile = profile._json;
  const username = profile.login;

  const userInLocalDB = user => {
    // Put the directus user profile in local DB for quicker session
    //   management
    db.put(username, JSON.stringify(user))
      .then((res) => done(null, user))
      .catch(done);
  };

  // Get directus user profile object in order to have access to the user's ID
  directus.getOrCreateItem('gh_users', {
    'in[username]': username
  }, {username})
    .then(userInLocalDB)
    .catch(done);
};

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);
passport.use(new GithubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, onGitHubLogin));

module.exports = passport;

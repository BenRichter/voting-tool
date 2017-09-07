const path = require('path');
const express = require('express');
const compression = require('compression');
const debug = require('debug');
const passport = require('passport');
const level = require('level');
const session = require('express-session');
const LevelStore = require('express-session-level')(session);
const GithubStrategy = require('passport-github2').Strategy;
const router = require('./routes/');
require('dotenv').config();

const db = level('./db');
const httpDebug = debug('voting:http');
const dbDebug = debug('voting:db');

httpDebug('Starting server');

// Exit with error if required keys are missing
if (
  !process.env.GITHUB_CLIENT_ID ||
  !process.env.GITHUB_CLIENT_SECRET ||
  !process.env.GITHUB_CALLBACK_URL ||
  !process.env.SESSION_SECRET
) {
  console.error('Required environment variables missing');
  process.exit(1);
}

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);
passport.use(new GithubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, onGitHubLogin));

express()
  .set('view engine', 'ejs')
  .set('views', path.join(__dirname, 'views'))
  .set('x-powered-by', false)
  .use(compression())
  .use(session({
    saveUninitialized: true,
    resave: false,
    secret: process.env.SESSION_SECRET,
    store: new LevelStore(db)
  }))
  .use(express.static(path.join(__dirname, 'public'), {maxage: '31d'}))
  .use(passport.initialize())
  .use(passport.session())
  .use(router)
  .listen(process.env.PORT || 3000, showServerStartedMessage);

function serializeUser(profile, done) {
  return done(null, profile.id);
}

function deserializeUser(id, done) {
  db.get(id, (err, user) => {
    if (err) return done(err);
    return done(null, JSON.parse(user));
  });
}

function onGitHubLogin(accessToken, refreshToken, profile, done) {
  db.put(profile.id, JSON.stringify(profile), err => {
    if (err) return done(err);
    return done(null, profile);
  });
}

function renderHomepage(req, res) {
  res.render('index');
}

function showServerStartedMessage() {
  httpDebug(`Server started at port ${process.env.PORT || 3000}`);
}

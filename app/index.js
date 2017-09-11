/**
 * Server & index file of application
 *
 * Connects different express middleware functions and listens
 *   to the provided port.
 */
const path = require('path');
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const LevelStore = require('express-session-level')(session);

const passport = require('./passport');
const db = require('./db');
const router = require('./routes/');

// Inject variables from .env file to process.env object
require('dotenv').config();

const showServerStartedMessage = () => console.log('Server started');

express()
  .set('view engine', 'ejs')
  .set('views', path.join(__dirname, 'views'))
  .set('x-powered-by', false)
  .use(compression())
  .use(bodyParser.urlencoded({extended: false}))
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

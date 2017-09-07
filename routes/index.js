const router = require('express').Router();
const axios = require('axios');
const db = require('../db');
const client = require('../directus');

router
  .use('/auth', require('./auth'))
  .get('/', sendHome)
  .get('/request/:id', sendDetails)
  .all('*', send404);

/**
 * Get highest ranked requests and render to index page
 */
function sendHome(req, res) {
  client
    .getItems('requests', {
      limit: 10,
      'order[votes]': 'DESC',
      status: 1
    })
    .then(({data}) => {
      res.render('index', {
        user: req.user, // Include currently logged in user
        requests: data
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
}

/**
 * Get the data of the single request + comments
 *   and populate the user fields
 */
function sendDetails(req, res) {
  // Wait for both data sources to return before rendering
  Promise.all([
    client
      .getItem('requests', req.params.id)
      .then(async ({data}) => {
        // If the data is an empty array, it means that the record doesn't exist
        //   in Directus. Render the 404 page instead.
        if (Array.isArray(data)) {
          return res.status(404).render('404');
        }

        // Add a user key to the data object
        data.user = await getUser(data.username);

        // Return the data to the promise all handler
        return data;
      }),
    client
      .getItems('comments', {
        'in[request_id]': req.params.id
      })
  ])
    .then(values => res.render('detail', {
      request: values[0],
      comments: values[1]
    }))
    .catch(err => {
      res.status(500).end();
      console.error(err);
    });
}

/**
 * Returns a promise which resolves with the user object based
 *   on the passed username
 */
function getUser(username) {
  return new Promise((resolve, reject) => {
    // Try getting the user object from the local DB
    db
    .get(username)

    // If it succeeds, send the local copy
    .then(user => resolve(user))

    // If not, fetch user profile from GitHub's api
    .catch(err => {
      if (err.notFound) {
        return axios
          .get(`https://api.github.com/users/${username}?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`)

          // When GitHub responds with the user, save it to the local
          //   db so it's cached for the next call
          .then(user => {
            db
              .put(username, user)
              .then(() => resolve(user))
              .catch(err => reject(err));
          })
          .catch(err => reject(err))
      }

      reject(err);
    });
  });
}

/**
 * Render the 404 page
 */
function send404(req, res) {
  res.status(404).render('404');
}

module.exports = router;

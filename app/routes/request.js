const router = require('express').Router();

const {parseDate, dateToString, parseRequestData} = require('../utils');
const directus = require('../directus');
const comment = require('./comment');

const renderRequest = (req, res) => {
  const id = req.params.id;
  const username = req.user;

  // Redirect back home if user isn't logged in
  if (!username) return res.redirect('/');

  // Set editMode flag when the query param `edit` is set to a truthy value
  const editMode = Boolean(req.query.edit) || false;

  directus
    .getItem('requests', id)
    .then(response => response.data)
    .then(data => parseRequestData(data, username))
    .then(request => ({request, editMode})) // add editMode key to locals
    .then(locals => res.render('request', locals))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
};

const updateRequest = (req, res) => {
  const username = req.user;
  const id = req.params.id;
  const newTitle = req.body.title;

  // Get request from DB
  directus
    .getItem('requests', id)

    // If current logged in user is the creator of the request, update the
    //   item in Directus. Else, redirect back without doing anything
    .then(({data}) => {
      if (data.username === username) {
        return directus.updateItem('requests', id, {
          title: newTitle,
          last_updated: dateToString(new Date())
        });
      }
      return res.redirect('/r/' + id);
    })

    // Redirect back to the original post when the update is done
    .then(() => res.redirect('/r/' + id))
    .catch(err => {
      console.error(err);
      return res.status(500).end();
    })
};

module.exports = router
  .get('/:id', renderRequest)
  .post('/:id', updateRequest);

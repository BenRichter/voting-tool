const level = require('level');

const db = level('./db');

module.exports = db;

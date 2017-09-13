/**
 * Parses a mysql date [YYYY-MM-DD HH:MM:SS] to a JS Date object
 * @param  {String} dateString YYYY-MM-DD HH:MM:SS
 * @return {Date}              JS Date object
 */
const parseDate = dateString => {
  const parts = dateString.split(/[- :]/);
  parts[1] = parts[1] - 1;
  return new Date(...parts);
};

/**
 * Converts a JS date object to YYYY-MM-DD HH:MM:SS string
 * @param  {Date} dateObj
 * @return {String}
 */
const dateToString = dateObj => `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()} ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;

module.exports = {parseDate, dateToString};

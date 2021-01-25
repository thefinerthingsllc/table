'use strict';

// Comparison:
// EQ | NE | LE | LT | GE | GT | NOT_NULL | NULL |
// CONTAINS | NOT_CONTAINS | BEGINS_WITH | IN | BETWEEN

function isAlphaNumeric (word) {
  var regex = /^[0-9a-zA-Z]+$/;
  return word.match(regex);
}

module.exports = {
  isAlphaNumeric: isAlphaNumeric,
};
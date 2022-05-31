'use strict';

var table = require('./table');
var datastore = require('./Datastore');

function init (params) {
  return datastore(params);
}

module.exports = {
  init: init,
  table: table,
};
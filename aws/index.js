'use strict';

var dynamodb = require('./DynamoDB');
var docClient = require('./DocClient');

var or = require('./or').or;
var or_key = require('./or').or_key;

var and = require('./and').and;
var index = require('./and').index;
var and_key = require('./and').and_key;

var set = require('./write').set;
var unset = require('./write').unset;

function init (params) {

  if (
    !params.region || !params.secretAccessKey || !params.accessKeyId
  ) return false;

  return {
    dynamodb: dynamodb(params),
    docClient: docClient(params),
  };
  
}

module.exports = {
  or: or,
  and: and,
  set: set,
  init: init,
  index: index,
  unset: unset,
  or_key: or_key,
  and_key: and_key,
};
'use strict';

var isAlphaNumeric = require('./utils').isAlphaNumeric;

function set (Key, params) {

  var UpdateExpression = 'SET ';
  var ExpressionAttributeNames = {};
  var ExpressionAttributeValues = {};

  for (var key in params) {
    if (key === Key) continue;
    if (!params[key]) continue;
    var val = params[key].toString();
    for (var i = 0; i < val.length; ++i) {
      if (!isAlphaNumeric(val[i])) continue;
      if (!ExpressionAttributeValues[`:${val[i]}`]) {
        ExpressionAttributeValues[`:${val[i]}`] = params[key];
        ExpressionAttributeNames[`#${val[i]}`] = key;
        val = val[i];
      }
    } UpdateExpression += `#${val} = :${val} , `;
  } UpdateExpression = UpdateExpression.substr(
    0, UpdateExpression.length - 3
  );

  return {
    UpdateExpression: UpdateExpression,
    ExpressionAttributeNames: ExpressionAttributeNames,
    ExpressionAttributeValues: ExpressionAttributeValues,
  };
}

function unset (Key, params) {

  var ExpressionAttributeNames = {};
  var UpdateExpression = 'REMOVE ';

  for (var key in params) {
    if (key === Key) continue;
    var k = key[0];
    for (var i = 0; i < key.length; ++i) {
      k = key[i];
      if (!isAlphaNumeric(k)) continue;
      if (!ExpressionAttributeNames[`#${k}`]) {
        ExpressionAttributeNames[`#${k}`] = key;
        i = key.length;
      }
    } UpdateExpression += `#${k} , `;
  } UpdateExpression = UpdateExpression.substr(
    0, UpdateExpression.length - 3
  );

  return {
    UpdateExpression: UpdateExpression,
    ExpressionAttributeNames: ExpressionAttributeNames,
  };
}

module.exports = {
    set: set,
    unset: unset,
};
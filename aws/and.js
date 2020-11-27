'use strict';

var isAlphaNumeric = require('./utils').isAlphaNumeric;

function and_key (key, array, fe, eav) {

  var FilterExpression = fe || '';
  var ExpressionAttributeValues = eav || {};

  for (var a of array) {
    var val = a.toString();
    for (var i = 0; i < val.length; ++i) {
      if (!isAlphaNumeric(val[i])) continue;
      if (!ExpressionAttributeValues[':' + val[i]]) {
        ExpressionAttributeValues[':' + val[i]] = a;
        val = val[i];
      }
    } FilterExpression += key + ' = ' + ':' + val + ' and ';
  } FilterExpression = FilterExpression.substr(0, FilterExpression.length - 5);

  return { 
    FilterExpression: FilterExpression,
    ExpressionAttributeValues: ExpressionAttributeValues,
  };
}

function and (params) {

  var FilterExpression = '';
  var ExpressionAttributeValues = {};

  for (var key in params) {
    var val = params[key].toString();
    for (var i = 0; i < val.length; ++i) {
      if (Array.isArray(val[i])) {
        var result = and_key(key, val[i], FilterExpression, ExpressionAttributeValues);
        FilterExpression = result.FilterExpression;
        ExpressionAttributeValues = result.ExpressionAttributeNames;
        continue;
      } else if (!isAlphaNumeric(val[i])) continue;
      if (!ExpressionAttributeValues[':' + val[i]]) {
        ExpressionAttributeValues[':' + val[i]] = params[key];
        val = val[i];
      }
    } FilterExpression += key + ' = ' + ':' + val + ' and ';
  } FilterExpression = FilterExpression.substr(0, FilterExpression.length - 5);

  return { 
    FilterExpression: FilterExpression, 
    ExpressionAttributeValues: ExpressionAttributeValues,
  };
}

function index (params) {

  var FilterExpression = '';
  var ExpressionAttributeNames = {};
  var ExpressionAttributeValues = {};

  for (var key in params) {
    var val = params[key].toString();
    for (var i = 0; i < val.length; ++i) {
      if (!isAlphaNumeric(val[i])) continue;
      if (!ExpressionAttributeValues[':' + val[i]]) {
        ExpressionAttributeValues[':' + val[i]] = params[key];
        ExpressionAttributeNames[`#${val[i]}`] = key;
        val = val[i];
      }
    } FilterExpression += '#' + val + ' = ' + ':' + val + ' and ';
  } FilterExpression = FilterExpression.substr(0, FilterExpression.length - 5);
  
  return {
      FilterExpression: FilterExpression,
      ExpressionAttributeNames: ExpressionAttributeNames,
      ExpressionAttributeValues: ExpressionAttributeValues,
  };
}

module.exports = {
    and: and,
    index: index,
    and_key: and_key,
};
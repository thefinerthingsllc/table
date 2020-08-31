var isAlphaNumeric = require('./utils').isAlphaNumeric;

function or (params) {

  var FilterExpression = '';
  var ExpressionAttributeValues = {};

  for (var key in params) {
    var val = params[key].toString();
    for (var i = 0; i < val.length; ++i) {
      if (!isAlphaNumeric(val[i])) continue;
      if (!ExpressionAttributeValues[':' + val[i]]) {
        ExpressionAttributeValues[':' + val[i]] = params[key];
        val = val[i];
      }
    } FilterExpression += key + ' = ' + ':' + val + ' or ';
  } FilterExpression = FilterExpression.substr(0, FilterExpression.length - 4);
  
  return { 
    FilterExpression: FilterExpression, 
    ExpressionAttributeValues: ExpressionAttributeValues,
  };
}

function or_key (key, array) {

  var FilterExpression = '';
  var ExpressionAttributeValues = {};

  for (var a of array) {
    var val = a.toString();
    for (var i = 0; i < val.length; ++i) {
      if (!isAlphaNumeric(val[i])) continue;
      if (!ExpressionAttributeValues[':' + val[i]]) {
          ExpressionAttributeValues[':' + val[i]] = a;
          val = val[i];
      }
    } FilterExpression += key + ' = ' + ':' + val + ' or ';
  } FilterExpression = FilterExpression.substr(0, FilterExpression.length - 4);

  return { 
    FilterExpression: FilterExpression, 
    ExpressionAttributeValues: ExpressionAttributeValues,
  };
}

module.exports = {
    or: or,
    or_key: or_key,
};
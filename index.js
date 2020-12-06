'use strict';

var Promise = require('bluebird');
var aws = require('./aws');

const id = (last) => (last && last.id) || last || null;
module.exports = function (params) {
  
  var me = {};
  var res = aws.init(params);
  
  me['info'] = params;
  me['dynamodb'] = res.dynamodb;
  me['docClient'] = res.docClient;

  return {
    set: function (table_name, key, limit) {
      if (!table_name) return false;
  
      me[table_name] = {
        TableName: table_name,
        Key: key || 'id',
        Limit: limit || -1
      };
  
      return me[table_name];
    },
  
    table: function (name) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      var schema = [
        { AttributeName: me[name].Key, AttributeType: 'S'}
      ];
  
      var keys = [
        { AttributeName: me[name].Key, KeyType: 'HASH' }
      ];
  
      var params = {
        TableName: me[name].TableName,
        KeySchema: keys,
        AttributeDefinitions: schema,
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
        }
      };
  
      return new Promise((resolve, reject) => {
        me.dynamodb.createTable(params, (err, data) => {
          if (err) reject(err);
          else resolve(data || {});
        });
      });
    },
  
    count: function (name) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      return new Promise((resolve, reject) => {
        me.docClient.scan({
          TableName: me[name].TableName,
          Select: 'COUNT'
        }, (err, data) => {
          if (err) reject(err);
          else resolve(data ? data.Count : 0);
        });
      });
    },
  
    get: function (name, id) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      var key = {};
      key[me[name].Key] = id;
  
      var tmp = {
        TableName: me[name].TableName,
        Key: key
      };
  
      return new Promise((resolve, reject) => {
        me.docClient.get(tmp, (err, data) => {
          if (err) reject(err);
          else resolve(data ? data.Item : {});
        });
      });
    },
  
    all: function (name, last) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      var params = {TableName: me[name].TableName};
      if (me[name].Limit !== -1) params.Limit = me[name].Limit;

      if (last) {
        params.ExclusiveStartKey = {};
        params.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.scan(params, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? id(data.LastEvaluatedKey) : null
          });
        });
      });
    },
  
    index: function (name, index, params, last) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      var tmp = aws.index(params);
      tmp.IndexName = index;
      tmp.TableName = me[name].TableName;

      if (me[name].Limit !== -1) tmp.Limit = me[name].Limit;
      if (last) {
        tmp.ExclusiveStartKey = {};
        tmp.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.scan(tmp, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? id(data.LastEvaluatedKey) : null
          });
        });
      });
    },
  
    index_search: function (name, index, key, array, last) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      var tmp = aws.or_key(key, array);
      tmp.IndexName = index;
      tmp.TableName = me[name].TableName;

      if (me[name].Limit !== -1) tmp.Limit = me[name].Limit;
      if (last) {
        tmp.ExclusiveStartKey = {};
        tmp.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.scan(tmp, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? id(data.LastEvaluatedKey) : null
          });
        });
      });
    },
  
    find: function (name, params, last) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      var tmp = aws.and(params);
      tmp.TableName = me[name].TableName;
  
      if (me[name].Limit !== -1) tmp.Limit = me[name].Limit;
      if (last) {
        tmp.ExclusiveStartKey = {};
        tmp.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.scan(tmp, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? id(data.LastEvaluatedKey) : null
          });
        });
      });
    },
  
    grab: function (name, params, last) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      var tmp = aws.or(params);
      tmp.TableName = me[name].TableName;
  
      if (me[name].Limit !== -1) tmp.Limit = me[name].Limit;
      if (last) {
        tmp.ExclusiveStartKey = {};
        tmp.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.scan(tmp, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? id(data.LastEvaluatedKey) : null
          });
        });
      });
    },
  
    search: function (name, key, array, last) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      var tmp = aws.or(key, array);
      tmp.TableName = me[name].TableName;
  
      if (me[name].Limit !== -1) tmp.Limit = me[name].Limit;
      if (last) {
        tmp.ExclusiveStartKey = {};
        tmp.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.scan(tmp, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? id(data.LastEvaluatedKey) : null
          });
        });
      });
    },
  
    create: function (name, params) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      var tmp = {
        TableName: me[name].TableName,
        Item: params
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.put(tmp, (err, data) => {
          if (err) reject(err);
          else resolve(data ? data : {});
        });
      });
    },
  
    update: function (name, id, params) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      var Key = {};
      Key[me[name].Key] = id;
  
      var tmp = aws.set(me[name].Key, params);
      tmp.Key = Key;
      tmp.ReturnValues = 'ALL_NEW';
      tmp.TableName = me[name].TableName;
  
      return new Promise((resolve, reject) => {
        me.docClient.update(tmp, (err, data) => {
          if (err) reject(err);
          else resolve(data ? data.Attributes : {});
        });
      });
    },
  
    remove: function (name, params) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      var key = {};
      key[me[name].Key] = params[me[name].Key];
  
      var tmp = aws.unset(me[name].Key, params);
      tmp.Key = key;
      tmp.ReturnValues = 'ALL_NEW';
      tmp.TableName = me[name].TableName;
  
      return new Promise((resolve, reject) => {
        me.docClient.update(tmp, (err, data) => {
          if (err) reject(err);
          else resolve(data ? data.Attributes : {});
        });
      });
    },
  
    delete: function (name, id) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      var key = {};
      key[me[name].Key] = id;
  
      var tmp = {
        TableName: me[name].TableName,
        Key: key
      };
  
      return new Promise((resolve, reject) => {
        me.docClient.delete(tmp, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    }
  };
}

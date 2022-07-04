'use strict';

var Promise = require('bluebird');

var aws = require('./aws');
var gcp = require('./gcp');
var test = require('./test');

function ID (last) {
  return (last && last.id) || last || null;
}

module.exports = function (params) {
  
  var me = {};
  var res = aws.init(params);
  
  me['info'] = params;
  if (res) me['dynamodb'] = res.dynamodb;
  if (res) me['docClient'] = res.docClient;

  if (params.test) me['test'] = params.test;

  if (params.gcp) {
    var gres = gcp.init(params.gcp);
    me['datastore'] = gres.datastore;
    me['Datastore'] = gres.Datastore;
  }

  return {
    set: function (table_name, key, limit) {
      if (!table_name) return false;
  
      me[table_name] = {
        Key: key || 'id',
        Limit: limit || -1,
        TableName: table_name,
      };
  
      return me[table_name];
    },
  
    table: function (name, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
      
      if (me.test && me.test.enabled) return new Promise(
        (resolve, reject) => resolve({ name })
      );
      
      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));

      if (isGCP) return gcp.table.table(me, name);
  
      var schema = [
        { AttributeName: me[name].Key, AttributeType: 'S' }
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
  
    count: function (name, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
      
      if (me.test && me.test.enabled) return test.count(me.test, name);

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));
    
      if (isGCP) return gcp.table.count(me, name);
  
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
  
    get: function (name, id, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
      
      if (me.test && me.test.enabled) return test.get(me.test, name, id);

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));

      if (isGCP) return gcp.table.get(me, name, id);
  
      var key = {};
      if (!id.length && typeof id == typeof {})
        for (var i in id)
          key[i] = id[i];
      else 
        key[me[name].Key] = id;
  
      var tmp = {
        Key: key,
        TableName: me[name].TableName,
      };
  
      return new Promise((resolve, reject) => {
        me.docClient.get(tmp, (err, data) => {
          if (err) reject(err);
          else resolve(data ? data.Item : {});
        });
      });
    },
  
    all: function (name, last, limit, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });

      if (me.test && me.test.enabled) return test.all(me.test, name, last, limit);

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));
  
      if (isGCP) return gcp.table.all(me, name, last, limit);
  
      var params = { TableName: me[name].TableName };
      if (me[name].Limit !== -1) params.Limit = me[name].Limit;
      if (limit) params.Limit = limit;

      if (last) {
        params.ExclusiveStartKey = {};
        if (!last.length && typeof last == typeof {})
          for (var l in last)
            params.ExclusiveStartKey[l] = last[l];
        else
          params.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.scan(params, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? ID(data.LastEvaluatedKey) : null
          });
        });
      });
    },

    query_all: function (name, last, limit, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });

      if (me.test && me.test.enabled) return test.all(me.test, name, last, limit);

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));
  
      if (isGCP) return gcp.table.query_all(me, name, last, limit);

      var tmp = { TableName: me[name].TableName };
      // TODO: build query for all where id is not_null and sort key is not null
      if (me[name].Limit !== -1) tmp.Limit = me[name].Limit;
      if (limit) tmp.Limit = limit;

      if (last) {
        tmp.ExclusiveStartKey = {};
        if (!last.length && typeof last == typeof {})
          for (var l in last)
            tmp.ExclusiveStartKey[l] = last[l];
        else
          tmp.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.query(tmp, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? ID(data.LastEvaluatedKey) : null
          });
        });
      });
    },
  
    index: function (name, index, params, last, limit, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      if (me.test && me.test.enabled) return test.index(me.test, name, index, params, last, limit);

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));

      if (isGCP) return gcp.table.index(me, name, index, params, last, limit);
      
      var tmp = aws.index(params);
      tmp.IndexName = index;
      tmp.TableName = me[name].TableName;

      if (me[name].Limit !== -1) tmp.Limit = me[name].Limit;
      if (limit) tmp.Limit = limit;
      if (last) {
        tmp.ExclusiveStartKey = {};
        if (!last.length && typeof last == typeof {})
          for (var l in last)
            tmp.ExclusiveStartKey[l] = last[l];
        else
          tmp.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.scan(tmp, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? ID(data.LastEvaluatedKey) : null
          });
        });
      });
    },
  
    index_search: function (name, index, key, array, last, limit, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      if (me.test && me.test.enabled) return test.all(me.test, name, index, key, array, last, limit);

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));

      if (isGCP) return gcp.table.index_search(me, name, index, key, array, last, limit);

      var tmp = aws.or_key(key, array);
      tmp.IndexName = index;
      tmp.TableName = me[name].TableName;

      if (me[name].Limit !== -1) tmp.Limit = me[name].Limit;
      if (limit) tmp.Limit = limit;
      if (last) {
        tmp.ExclusiveStartKey = {};
        if (!last.length && typeof last == typeof {})
          for (var l in last)
            tmp.ExclusiveStartKey[l] = last[l];
        else
          tmp.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.scan(tmp, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? ID(data.LastEvaluatedKey) : null
          });
        });
      });
    },
  
    find: function (name, params, last, limit, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
      
      if (me.test && me.test.enabled) return test.find(me.test, name, params, last, limit);

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));
  
      if (isGCP) return gcp.table.find(me, name, params, last, limit);

      var tmp = aws.and(params);
      tmp.TableName = me[name].TableName;
  
      if (me[name].Limit !== -1) tmp.Limit = me[name].Limit;
      if (limit) tmp.Limit = limit;
      if (last) {
        tmp.ExclusiveStartKey = {};
        if (!last.length && typeof last == typeof {})
          for (var l in last)
            tmp.ExclusiveStartKey[l] = last[l];
        else
          tmp.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.scan(tmp, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? ID(data.LastEvaluatedKey) : null
          });
        });
      });
    },
  
    grab: function (name, params, last, limit, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      if (me.test && me.test.enabled) return test.all(me.test, name, params, last, limit);
        
      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));
  
      if (isGCP) return gcp.table.grab(me, name, params, last, limit);

      var tmp = aws.or(params);
      tmp.TableName = me[name].TableName;
  
      if (me[name].Limit !== -1) tmp.Limit = me[name].Limit;
      if (limit) tmp.Limit = limit;
      if (last) {
        tmp.ExclusiveStartKey = {};
        if (!last.length && typeof last == typeof {})
          for (var l in last)
            tmp.ExclusiveStartKey[l] = last[l];
        else
          tmp.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.scan(tmp, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? ID(data.LastEvaluatedKey) : null
          });
        });
      });
    },
  
    search: function (name, key, array, last, limit, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
      
      if (me.test && me.test.enabled) return test.all(me.test, name, last, limit);

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));
  
      if (isGCP) return gcp.table.search(me, name, key, array, last, limit);
        
      var tmp = aws.or(key, array);
      tmp.TableName = me[name].TableName;
  
      if (me[name].Limit !== -1) tmp.Limit = me[name].Limit;
      if (limit) tmp.Limit = limit;
      if (last) {
        tmp.ExclusiveStartKey = {};
        if (!last.length && typeof last == typeof {})
          for (var l in last)
            tmp.ExclusiveStartKey[l] = last[l];
        else
          tmp.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.scan(tmp, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? ID(data.LastEvaluatedKey) : null
          });
        });
      });
    },

    scan: function (name, params, last, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));
  
      if (isGCP || (me.test && me.test.enabled)) return new Promise(
        (resolve, reject) => {
          reject(`This operation for ${name} does not exist!`);
        }
      );

      var tmp = params;
      tmp.TableName = me[name].TableName;
      if (!tmp.Limit && me[name].Limit !== -1) tmp.Limit = me[name].Limit;

      if (last) {
        tmp.ExclusiveStartKey = {};
        if (!last.length && typeof last == typeof {})
          for (var l in last)
            tmp.ExclusiveStartKey[l] = last[l];
        else
          tmp.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.scan(tmp, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? ID(data.LastEvaluatedKey) : null
          });
        });
      });
    },

    query: function (name, params, last, limit, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));

      if (isGCP || (me.test && me.test.enabled)) return new Promise(
        (resolve, reject) => {
          reject(`This operation for ${name} does not exist!`);
        }
      );

      var tmp = params;
      tmp.TableName = me[name].TableName;
      if (!tmp.Limit && me[name].Limit !== -1) tmp.Limit = me[name].Limit;
      if (limit) tmp.Limit = limit;

      if (last) {
        tmp.ExclusiveStartKey = {};
        if (!last.length && typeof last == typeof {})
          for (var l in last)
            tmp.ExclusiveStartKey[l] = last[l];
        else
          tmp.ExclusiveStartKey[me[name].Key] = last;
      }
  
      return new Promise((resolve, reject) => {
        me.docClient.query(tmp, (err, data) => {
          if (err) reject(err);
          else resolve({
            data: data ? data.Items : [],
            last: data ? ID(data.LastEvaluatedKey) : null
          });
        });
      });
    },
  
    create: function (name, params, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });
  
      if (me.test && me.test.enabled) return test.create(me.test, name, params);

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));
  
      if (isGCP) return gcp.table.create(me, name, params);

      var tmp = {
        Item: params,
        TableName: me[name].TableName,
      };
  
      return new Promise((resolve, reject) => {
        me.docClient.put(tmp, (err, data) => {
          if (err) reject(err);
          else resolve(data ? data : {});
        });
      });
    },
  
    update: function (name, id, params, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });

      if (me.test && me.test.enabled) return test.update(me.test, name, id, params);

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));
  
      if (isGCP) return gcp.table.update(me, name, id, params);

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
  
    remove: function (name, params, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });

      if (me.test && me.test.enabled) return test.remove(me.test, name, params);

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));
  
      if (isGCP) return gcp.table.remove(me, name, params);

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
  
    delete: function (name, id, database) {
      if (!me[name] || !me[name].TableName) 
        return new Promise((resolve, reject) => {
          reject(`Table, ${name}, does not exist!`);
        });

      if (me.test && me.test.enabled) return test.delete(me.test, name, id);

      var isGCP = me.datastore && database && database.toLowerCase() === 'gcp';
      isGCP = isGCP || (me.datastore && (!me.dynamodb || !me.docClient));
  
      if (isGCP) return gcp.table.delete(me, name, id);

      var key = {};
      key[me[name].Key] = id;
  
      var tmp = {
        Key: key,
        TableName: me[name].TableName,
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

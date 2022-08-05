'use strict';

module.exports = {

  table: function (me, name) {
    if (!me[name] || !me[name].TableName) return;
    return me[name];
  },

  count: function (me, name) {
    if (!me[name] || !me[name].TableName) return;
    return me.datastore.runQuery(
      me.datastore.createQuery("__Stat_Kind__")
    ).then(
      ([ data ]) => data.filter(d => d.kind_name === name)
    ).then(
      ([ data ]) => data ? data.count : 0
    );
  },

  get: function (me, name, id) {
    if (!me[name] || !me[name].TableName) return;
    return me.datastore.get(
      me.datastore.key([ name, id ])
    ).then(([ data ]) => data);
  },

  all: function (me, name, last, limit) {
    if (!me[name] || !me[name].TableName) return;
    let query = me.datastore.createQuery(name);

    if (limit) query = query.limit(limit);
    if (last) query = query.start(last);

    return me.datastore.runQuery(query).then(([ data, info ]) => {
      if (info.moreResults !== me.datastore.NO_MORE_RESULTS) {
        return {
          data,
          last: info.endCursor,
        };
      } return { data, last: null };
    });
  },

  query_all: function (me, name, last, limit) {
    if (!me[name] || !me[name].TableName) return;
    let query = me.datastore.createQuery(name);

    if (limit) query = query.limit(limit);
    if (last) query = query.start(last);

    return me.datastore.runQuery(query).then(([ data, info ]) => {
      if (info.moreResults !== me.datastore.NO_MORE_RESULTS) {
        return {
          data,
          last: info.endCursor,
        };
      } return { data, last: null };
    });
  },

  index: function (me, name, index, params, last, limit) {
    if (!me[name] || !me[name].TableName) return;
    let query = me.datastore.createQuery(name);

    if (limit) query = query.limit(limit);
    if (last) query = query.start(last);

    for (let k in params) query = query.filter(k, '=', params[k]);

    return me.datastore.runQuery(query).then(([ data, info ]) => {
      if (info.moreResults !== me.Datastore.NO_MORE_RESULTS) {
        return {
          data,
          last: info.endCursor,
        };
      } return { data, last: null };
    });
  },

  index_search: function (me, name, index, key, array, last, limit) {
    if (!me[name] || !me[name].TableName) return;
    let query = me.datastore.createQuery(name);

    if (limit) query = query.limit(limit);
    if (last) query = query.start(last);

    for (let i = 0; i < array.length; i++) {
      query = query.filter(key, '>', array[i]);
      query = query.filter(key, '<', array[i]);
    }

    return me.datastore.runQuery(query).then(([ data, info ]) => {
      if (info.moreResults !== me.datastore.NO_MORE_RESULTS) {
        return {
          data,
          last: info.endCursor,
        };
      } return { data, last: null };
    });
  },

  find: function (me, name, params, last, limit) {
    if (!me[name] || !me[name].TableName) return;
    let query = me.datastore.createQuery(name);

    if (limit) query = query.limit(limit);
    if (last) query = query.start(last);

    for (let k in params) query = query.filter(k, '=', params[k]);

    return me.datastore.runQuery(query).then(([ data, info ]) => {
      if (info.moreResults !== me.Datastore.NO_MORE_RESULTS) {
        return {
          data,
          last: info.endCursor,
        };
      } return { data, last: null };
    });
  },

  grab: function (me, name, params, last, limit) {
    if (!me[name] || !me[name].TableName) return;
    let query = me.datastore.createQuery(name);

    if (limit) query = query.limit(limit);
    if (last) query = query.start(last);

    for (let k in params) {
      query = query.filter(k, '>', params[k]);
      query = query.filter(k, '<', params[k]);
    }

    return me.datastore.runQuery(query).then(([ data, info ]) => {
      if (info.moreResults !== me.Datastore.NO_MORE_RESULTS) {
        return {
          data,
          last: info.endCursor,
        };
      } return { data, last: null };
    });
  },

  search: function (me, name, key, array, last, limit) {
    if (!me[name] || !me[name].TableName) return;
    let query = me.datastore.createQuery(name);

    if (limit) query = query.limit(limit);
    if (last) query = query.start(last);

    for (let i = 0; i < array.length; i++) {
      query = query.filter(key, '>', array[i]);
      query = query.filter(key, '<', array[i]);
    }

    return me.datastore.runQuery(query).then(([ data, info ]) => {
      if (info.moreResults !== me.Datastore.NO_MORE_RESULTS) {
        return {
          data,
          last: info.endCursor,
        };
      } return { data, last: null };
    });
  },

  create: function (me, name, params) {
    if (!me[name] || !me[name].TableName) return;
    
    const table = me[name];
    if (!params[table.Key]) return;
    
    const data = {};
    const key = me.datastore.key([name, params[table.Key]]);

    for (let k in params) data[k] = params[k];
    
    return me.datastore.upsert({ key, data });
  },

  update: function (me, name, id, params) {
    if (!me[name] || !me[name].TableName) return;

    const key = me.datastore.key([ name, id ]);
    
    return me.datastore.get(key).then(
      ([ data ]) => {
        for (let k in params) data[k] = params[k];
        return me.datastore.update({ key, data }).then(() => data);
      }
    );
  },

  remove: function (me, name, params) {
    if (!me[name] || !me[name].TableName) return;
    
    const table = me[name];
    if (!params[table.Key]) return;

    const key = me.datastore.key([ name, params[table.Key] ]);
    return me.datastore.get(key).then(([ data ]) => {
      for (let k in params) k != table.Key && delete data[k];
      return me.datastore.upsert({ key, data });
    });
  },

  delete: function (me, name, id) {
    if (!me[name] || !me[name].TableName) return;
    return me.datastore.delete(me.datastore.key([ name, id ]));
  }
  
};
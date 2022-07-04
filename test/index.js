'use strict';

var json = require('./json');

module.exports = {

  table: function (me, name) {
    if (!me[name]) return;
    return me[name];
  },

  count: function (me, name) {
    if (!me[name]) return;
    return json.read(me[name]).then(
      data => data.length || 0
    );
  },

  get: function (me, name, id) {
    if (!me[name]) return;
    return json.read(me[name]).then(data => {
      var res = data.filter(d => d.id == id);
      return res && res.length ? res[0] : {};
    });
  },

  all: function (me, name, last, limit) {
    if (!me[name]) return;
    return json.read(me[name]);
  },

  index: function (me, name, index, params, last, limit) {
    if (!me[name]) return;
    return json.read(me[name]);
  },

  index_search: function (me, name, index, key, array, last, limit) {
    if (!me[name]) return;
    return json.read(me[name]);
  },

  find: function (me, name, params, last, limit) {

    if (!me[name]) return;
    
    return json.read(me[name]).then(data => {

      var res = data.filter(d => {

        var match = true;

        for (var k in params)
          match = match && (
            params[k] == d[k]
          );

        return match;

      });
      
      return res;

    });

  },

  grab: function (me, name, params, last, limit) {

    if (!me[name]) return;
    
    return json.read(me[name]).then(data => {

      var res = data.filter(d => {

        var match = false;

        for (var k in params)
          match = match || (
            params[k] == d[k]
          );

        return match;

      });
      
      return res;

    });

  },

  search: function (me, name, key, array, last, limit) {

    if (!me[name]) return;
    
    return json.read(me[name]).then(data => {

      var res = data.filter(d => {

        var match = false;

        for (var i in array)
          match = match || (
            array[i] == d[key]
          );

        return match;

      });
      
      return res;

    });

  },

  create: function (me, name, params) {

    if (!me[name]) return;

    return json.read(me[name]).then(data => {
      var tmp = data.map(d => d);
      tmp.push(params);
      return tmp;
    }).then(
      data => json.write(me[name], data).then(() => data)
    );

  },

  update: function (me, name, id, params) {

    if (!me[name]) return;

    return json.read(me[name]).then(

      data => data.map(d => {

        var tmp = d;

        if (tmp.id == id) {
          for (var k in params) {
            tmp[k] = params[k];
          }
        }

        return tmp;

      })

    ).then(
      data => json.write(me[name], data).then(() => data)
    );

  },

  remove: function (me, name, params) {

    if (!me[name] || !params.id) return;

    return json.read(me[name]).then(

      data => data.map(d => {

        var tmp = d;

        if (tmp.id == params.id) {
          for (var k in params) {
            delete tmp[k];
          }
        }

        return tmp;

      })

    ).then(
      data => json.write(me[name], data).then(() => data)
    );

  },

  delete: function (me, name, id) {

    if (!me[name]) return;

    return json.read(me[name]).then(
      data => data.filter(d => d.id != id)
    ).then(
      data => json.write(me[name], data).then(() => data)
    );

  }

};
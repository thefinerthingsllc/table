'use strict';

var fs = require('fs');
var Promise = require('bluebird');

module.exports = {

  read: function (file_path) {
    return new Promise((resolve, reject) => {
      fs.readFile(file_path, (err, text) => {
        if (err) reject(err);
        else resolve(JSON.parse(text));
      });
    });
  },

  write: function (file_path, obj) {
    return new Promise((resolve, reject) => {
      fs.writeFile(file_path, JSON.stringify(obj), 'utf8', (err) => {
        if (err) reject(err);
        else resolve("Write complete!");
      });
    });
  },

};
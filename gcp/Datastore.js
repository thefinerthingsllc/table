'use strict';

function datastore (params) {
    const { Datastore } = require('@google-cloud/datastore');
    return {
      Datastore: Datastore,
      datastore: new Datastore(params)
    };
}

module.exports = datastore;
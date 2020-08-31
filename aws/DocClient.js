'use strict';

function docClient (params) {
    var aws = require('aws-sdk');
    aws.config.update(params);
    return new aws.DynamoDB.DocumentClient();
}

module.exports = docClient;

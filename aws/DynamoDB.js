'use strict';

function dynamodb (params) {
    var aws = require('aws-sdk');
    aws.config.update(params);
    return new aws.DynamoDB();
}

module.exports = dynamodb;
'use strict';

var config = require('../config');
var mongoose = require('mongoose');

var connection;

module.exports = {
	getConnection: function() {
		if (mongoose.connection.readyState === 0)
			mongoose.connect(config.mongodb.uri, { server: { auto_reconnect: true } });
		return mongoose.connection;
	}
};



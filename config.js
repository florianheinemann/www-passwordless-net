'use strict';

var config = {};
config.mongodb = {};
config.http = {};
config.sendgrid = {};

config.mongodb.host = process.env.MONGO_HOST || '127.0.0.1';
config.mongodb.port = process.env.MONGO_PORT || 27017;
config.mongodb.user = process.env.MONGO_USER || '';
config.mongodb.password = process.env.MONGO_PASSWORD || '';
config.mongodb.database = process.env.MONGO_DATABASE || 'wwwpasswordlessnet';

// Format:     mongodb://[username:password@]host1[:port1][/[database]
config.mongodb.uri = "mongodb://"
if(config.mongodb.user.length && config.mongodb.password.length)
	config.mongodb.uri += config.mongodb.user + ":" + config.mongodb.password + "@";
config.mongodb.uri += config.mongodb.host;
if(config.mongodb.port.toString().length)
	config.mongodb.uri += ":" + config.mongodb.port.toString();
if(config.mongodb.database.length)
	config.mongodb.uri += "/" + config.mongodb.database;

config.http.host_url = process.env.HTTP_HOST_URL || 'http://localhost'
config.http.port = process.env.PORT || 3000;
config.http.cookie_secret = process.env.HTTP_COOKIE_SECRET || 'JpJ2JtkNGjpAf.B8Lj%tj*2Ax';

config.sendgrid.from = process.env.SENDGRID_FROM || 'AN EMAIL ADDRESS';
config.sendgrid.api_user = process.env.SENDGRID_API_USER || 'API USER';
config.sendgrid.api_key = process.env.SENDGRID_API_KEY || 'API KEY';
config.sendgrid.subject = process.env.SENDGRID_SUBJECT || 'SUBJECT';

module.exports = config;
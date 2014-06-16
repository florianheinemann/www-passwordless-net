'use strict'

var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore');
var config = require('../config');
var sendgrid  = require('sendgrid')(config.sendgrid.api_user, config.sendgrid.api_key);

module.exports = function(app) {

	passwordless.init(new MongoStore(config.mongodb.uri,  {
				server: { auto_reconnect: true },
			    mongostore: { collection: 'tokens' }}));

	passwordless.addDelivery(
		function(tokenToSend, uidToSend, recipient, callback) {

			sendgrid.send({
				to:       recipient,
				from:     config.sendgrid.from,
				subject:  config.sendgrid.subject,
				// TODO: Replace with proper template
				text:    'Hello!\nAccess your account here: '
					+ config.http.host_url + '?token=' + encodeURIComponent(tokenToSend) 
					+ '&uid=' + encodeURIComponent(uidToSend)
			}, function(err, json) {
				if (err) { 
					return console.error(err);
				}
				callback(err);
			});
		});

	app.use(passwordless.sessionSupport());
	app.use(passwordless.acceptToken());

	// For every request: provide user data to the view
	app.use(function(req, res, next) {
		res.locals.user = req.user;
		next();
	})
}

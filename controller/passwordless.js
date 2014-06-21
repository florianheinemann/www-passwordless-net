'use strict'

var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore');
var config = require('../config');
var sendgrid  = require('sendgrid')(config.sendgrid.api_user, config.sendgrid.api_key);
var User = require('../models/user');

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
				text:    'Hello!\n\nYou have successfully set up your Passwordless acount and you can now access ' +
					'it by clicking on the following link: \n\n'
					+ config.http.host_url + '?token=' + encodeURIComponent(tokenToSend) 
					+ '&uid=' + encodeURIComponent(uidToSend) + '  \n\nSee you soon!'
			}, function(err, json) {
				if (err) { 
					console.error(err);
				}
				callback(err);
			});
		});

	app.use(passwordless.sessionSupport());
	app.use(passwordless.acceptToken( {successFlash: 'You are logged in now. Welcome to Passwordless!'} ));

	// For every request: provide user data to the view
	app.use(function(req, res, next) {
		if(req.user) {
			User.findById(req.user, function(error, user) {
				res.locals.user = user;
				next();
			});
		} else {
			next();
		}
	})
}

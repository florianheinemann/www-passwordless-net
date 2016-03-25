'use strict'

var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore');
var config = require('../config');
var User = require('../models/user');

var SparkPost = require('sparkpost');
var sparkpost_client = new SparkPost(config.sparkpost.api_key);

var emailText = function(html, token, uid) {
	var startP = function() { return (html) ? '<p>' : ''; }
	var endP = function() { return (html) ? '</p>' : '\n\n'; }
	var linkA = function(url) { return (html) ? ('<a href="' + url + '">' + url + '</a>') : url; }
	return startP() + 'Hello!' + endP() + 
					startP() + 'You have successfully set up your Passwordless account and you can now access ' +
					'it by clicking on the following link:' + endP() + 
					startP() + linkA(config.http.host_url + '/?token=' + encodeURIComponent(token) 
					+ '&uid=' + encodeURIComponent(uid)) + endP() + 
					startP() + 'See you soon!' + endP() + 
					startP() + 'Your Passwordless Team' + endP();
};

module.exports = function(app) {

	passwordless.init(new MongoStore(config.mongodb.uri,  {
				server: { auto_reconnect: true },
			    mongostore: { collection: 'tokens' }}));

	passwordless.addDelivery(
		function(tokenToSend, uidToSend, recipient, callback) {
			console.log('called');

			sparkpost_client.transmissions.send({
					transmissionBody: {
						content: 
						{
							from: config.email.from,
							subject: config.email.subject,
							html: emailText(true, tokenToSend, uidToSend),
							text: emailText(false, tokenToSend, uidToSend)
						},
						recipients: [{address: recipient}]
					}
				}, function(e, res) {
					if (e) {
									console.log('err');
						var err = 'An email delivery error occurred: ' + e;
					    console.log(err);
					    callback(err);
					} 
					else 
					{			console.log('suc');
						callback();
					}
			});
		});

	app.use(passwordless.sessionSupport());
	app.use(passwordless.acceptToken( {	successFlash: 'You are logged in. Welcome to Passwordless!', 
										failureFlash: 'The supplied token is not valid (anymore). Please request another one.',
										successRedirect: '/success' } ));

	// For every request: provide user data to the view
	app.use(function(req, res, next) {
		if(req.user) {
			User.findById(req.user, function(error, userdoc) {
				res.locals.user = userdoc;
				next();
			});
		} else {
			next();
		}
	})
}

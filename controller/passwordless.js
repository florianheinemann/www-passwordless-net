'use strict'

var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore');
var config = require('../config');
var User = require('../models/user');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config.mandrill.api_key);

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

			var message = {
			    "html": emailText(true, tokenToSend, uidToSend),
			    "text": emailText(false, tokenToSend, uidToSend),
			    "subject": config.mandrill.subject,
			    "from_email": config.mandrill.from,
			    "from_name": "Passwordless",
			    "to": [{
			            "email": recipient,
			            "name": "",
			            "type": "to"
			        }],
			    "headers": {
			        "Reply-To": config.mandrill.from
			    },
			};

			mandrill_client.messages.send({"message": message, "async": false, "ip_pool": null, "send_at": null}, 
				function(result) {
    				// success
    				callback();
				}, function(e) {
					var err = 'An email delivery error occurred: ' + e.name + ' - ' + e.message;
				    console.log(err);
				    callback(err);
				});
		});

	app.use(passwordless.sessionSupport());
	app.use(passwordless.acceptToken( {	successFlash: 'You are logged in. Welcome to Passwordless!', 
										failureFlash: 'The supplied token is not valid (anymore). Please request another one.',
										successRedirect: '/success' } ));

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

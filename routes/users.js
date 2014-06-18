var express = require('express');
var router = express.Router();
var passwordless = require('passwordless');
var User = require('../models/user');

router.use('/', passwordless.restricted({ failureRedirect: '/' }));

/* GET edit user. */
router.get('/edit', function(req, res) {
	res.render('account', { validation: req.flash('validation')[0], error: req.flash('error')[0] });
});

/* POST edit user. */
router.post('/edit', 
	// Input validation
	function(req, res, next) {
		req.checkBody('user', 'Please provide a valid email address').isLength(1,200).isEmail();
		req.sanitize('user').toLowerCase();
		req.sanitize('user').trim();

		req.checkBody('username', 'A username should not be more than 200 characters long').isLength(0,200);
		req.checkBody('color', 'Your color should not be more than 200 characters long').isLength(0,200);

		var errors = req.validationErrors(true);
		if (errors) {
			req.flash('validation', errors);
			res.redirect('/users/edit');
		} else {
			User.createOrUpdateUser(res.locals.user.email, req.body.username, req.body.color, req.body.user, function(error, user) {
				if(error) {
					console.log(error.toString());
					req.flash('error', 'Error updating your record. Maybe the used email address already exists?');
					res.redirect('/users/edit');
				} else {
					res.redirect('/');
				}
			})
		}
	});

module.exports = router;

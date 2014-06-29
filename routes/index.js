var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { validation: req.flash('validation')[0], 
		error: req.flash('passwordless')[0], success: req.flash('passwordless-success')[0], homepage: true });
});

/* GET logged in. */
router.get('/s', function(req, res) {
	res.render('success', { validation: req.flash('validation')[0], 
		error: req.flash('passwordless')[0], success: req.flash('passwordless-success')[0] });
});


/* GET get started. */
router.get('/getstarted', function(req, res) {
	res.render('getstarted');
});

/* GET deep dive. */
router.get('/deepdive', function(req, res) {
	res.render('deepdive');
});

/* GET get started. */
router.get('/plugins', function(req, res) {
	res.render('plugins');
});

/* GET deep dive. */
router.get('/about', function(req, res) {
	res.render('about');
});

module.exports = router;

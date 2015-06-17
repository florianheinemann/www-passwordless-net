'use strict';

var db = require('./db').getConnection();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var userSchema = new Schema({
	username: 		{ type: String, required: false },
	email: 			{ type: String, required: true, index: { unique: true } },
	color: 			{ type: String, required: false }
});

userSchema.statics.findUser = function(email, done) {
	email = email.toLowerCase();
	this.findOne({ email: email }, done);
};

userSchema.statics.deleteUser = function(email, callback) {
	if(!email || !callback)
		return callback('An email address has to be provided');

	email = email.toLowerCase().trim();
	this.remove({email: email}, function(err) {
		callback(err);
	})
}

userSchema.statics.createOrUpdateUser = function(email, username, color, newEmail, callback) {
	if(newEmail && !callback) {
		callback = newEmail;
		newEmail = undefined;
	}
	if(!newEmail)
		newEmail = email;
	if(!email)
		return callback('At least an email address has to be provided');
	email = email.toLowerCase().trim();
	newEmail = newEmail.toLowerCase().trim();

	var newUser = {
		email: newEmail,
		username: username,
		color: color
	};
	// Create or update user, return it
	this.findOneAndUpdate( { email: email } , newUser, { upsert: true, new:true }, function(error, user) {	

		console.log(user);

		callback(error, user);
	})
};

userSchema.virtual('md5').get(function () {
	return crypto.createHash('md5').update(this.email).digest("hex");
});

userSchema.virtual('gravatar').get(function () {
	var items = { 'Gravatar': '', 'Mystery man': 'mm', 
				'Identicon': 'identicon', 'Monster': 'monsterid', 
				'Wavatar' : 'wavatar', 'Retro' : 'retro', 'None': 'blank' };
	if(this.color.length && items[this.color] && items[this.color].length) {
		return 'https://www.gravatar.com/avatar/' + this.md5 + '?f=y&d=' + items[this.color];
	} else {
		return 'https://www.gravatar.com/avatar/' + this.md5 + '?&d=retro';
	}
});

var User = db.model('User', userSchema);

module.exports = User;
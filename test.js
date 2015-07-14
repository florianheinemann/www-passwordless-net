var assert = require('assert');
var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
//mongoose.set('debug', true);
//mongoose.connect('mongodb://127.0.0.1:27017/wwwpasswordlessnet');


var User = require('./models/user');

// var userSchema = mongoose.Schema({
//   username:     { type: String, required: false },
//   email:      { type: String, required: true, index: { unique: true } },
//   color:      { type: String, required: false }
// });

// var User = mongoose.model('Users', userSchema);


      User.remove({email: 'test'}, function(error) {
        assert.ifError(error);

        User.findOne({email: 'test'}, function(error, doc) {
          assert.ifError(error);
          assert.equal(doc, null);

          User.create({ email: 'test' }, function(error) {
            assert.ifError(error);
            User.findOne({email: 'test'}, function(error, doc) {
              assert.ifError(error);
              assert.ok(doc);
              console.log(JSON.stringify(doc));
              User.findById(doc._id, function(error, doc) {
                assert.ifError(error);
                assert.ok(doc);
                console.log(JSON.stringify(doc));
                console.log('done');
              });

            })
          });
        });
      });
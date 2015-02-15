The following should provide a quick-start on using Passwordless. If you need more details check out the [example](https://github.com/florianheinemann/passwordless/tree/master/examples/simple-mail), the [deep dive](https://passwordless.net/deepdive), or the [documentation](https://passwordless.net/docs/Passwordless.html). Also, don't hesitate to raise comments and questions on [GitHub](https://github.com/florianheinemann/passwordless/issues).

Passwordless offers token-based authentication for [express](http://expressjs.com/), a node.js framework for web applications. This guideline assumes that you already know how to build an express app. Should you need a refresher, you'll find a great [guide](http://expressjs.com/guide.html) on their site.

### 1. Install the module:

`$ npm install passwordless --save`

You'll also want to install a [TokenStore](https://passwordless.net/plugins) such as [MongoStore](https://github.com/florianheinemann/passwordless-mongostore) and something to deliver the tokens (be it email, SMS or any other means). For example:

`$ npm install passwordless-mongostore --save`

`$ npm install emailjs --save`

If you need to store your tokens differently consider [developing a new TokenStore](https://github.com/florianheinemann/passwordless-tokenstore-test) and [let us know](https://twitter.com/thesumofall).

### 2. Require the needed modules
You will need:
* Passwordless
* A TokenStore to store the tokens such as [MongoStore](https://github.com/florianheinemann/passwordless-mongostore)
* Something to deliver the tokens such as [emailjs](https://github.com/eleith/emailjs) for email or [twilio](https://www.twilio.com/docs/node/install) for text messages / SMS

```javascript
var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore');
var email   = require("emailjs");
```

### 3. Setup your delivery
This is very much depending on what you use to deliver your tokens, but if you use emailjs this could like this:
```javascript
var smtpServer  = email.server.connect({
   user:    yourEmail, 
   password: yourPwd, 
   host:    yourSmtp, 
   ssl:     true
});
```

### 4. Initialize Passwordless
`passwordless.init()` will take your TokenStore, which will store the generated tokens.
```javascript
// Your MongoDB TokenStore
var pathToMongoDb = 'mongodb://localhost/passwordless-simple-mail';
passwordless.init(new MongoStore(pathToMongoDb));
```

### 5. Tell Passwordless how to deliver a token
`passwordless.addDelivery(deliver)` adds a new delivery mechanism. `deliver` is called whenever a token has to be sent. By default, the mechanism you choose should provide the user with a link in the following format:

`http://www.example.com/token={TOKEN}&uid={UID}`

That's how you could do this with emailjs:
```javascript
// Set up a delivery service
passwordless.addDelivery(
	function(tokenToSend, uidToSend, recipient, callback) {
		var host = 'localhost:3000';
		smtpServer.send({
			text:    'Hello!\nAccess your account here: http://' 
			+ host + '?token=' + tokenToSend + '&uid=' 
			+ encodeURIComponent(uidToSend), 
			from:    yourEmail, 
			to:      recipient,
			subject: 'Token for ' + host
		}, function(err, message) { 
			if(err) {
				console.log(err);
			}
			callback(err);
		});
});
```

### 6. Setup the middleware for express
```javascript
app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken({ successRedirect: '/'}));
```

`sessionSupport()` makes the login persistent, so the user will stay logged in while browsing your site. It has to come after your session middleware. Have a look at [express-session](https://github.com/expressjs/session) how to setup sessions if you are unsure.

`acceptToken()` will accept incoming tokens and authenticate the user (see the URL in step 5). While the option `successRedirect` is not strictly needed, it is strongly recommended to use it to avoid leaking valid tokens via the referrer header of outgoing HTTP links on your site. When provided, the user will be forwarded to the given URL as soon as she has been authenticated.

If you like, you can also restrict the acceptance of tokens to certain URLs:
```javascript
// Accept tokens only on /logged_in (be sure to change the
// URL you deliver in step 5)
router.get('/logged_in', passwordless.acceptToken(), 
	function(req, res) {
		res.render('homepage');
});
```

### 7. The router
The following takes for granted that you've already setup your router `var router = express.Router();` as explained in the [express docs](http://expressjs.com/4x/api.html#router)

You will need at least URLs to:
* Display a page asking for the user's email (or phone number, ...)
* Receive these details (via POST) and identify the user

For example like this:
```javascript
/* GET login screen. */
router.get('/login', function(req, res) {
   res.render('login');
});

/* POST login details. */
router.post('/sendtoken', 
	passwordless.requestToken(
		// Turn the email address into an user ID
		function(user, delivery, callback, req) {
			// usually you would want something like:
			User.find({email: user}, callback(ret) {
			   if(ret)
			      callback(null, ret.id)
			   else
			      callback(null, null)
	      })
	      // but you could also do the following 
	      // if you want to allow anyone:
	      // callback(null, user);
		}),
	function(req, res) {
	   // success!
  		res.render('sent');
});
```

What happens here? `passwordless.requestToken(getUserId)` has two tasks: Making sure the email address exists *and* transforming it into a proper user ID that will become the identifier from now on. For example user@example.com becomes 123 or 'u1002'. You call `callback(null, ID)` if all is good, `callback(null, null)` if you don't know this email address, and `callback('error', null)` if something went wrong. At this stage, please make sure that you've added middleware to parse POST data (such as [body-parser](https://github.com/expressjs/body-parser).

Most likely, you want a user registration page where you take an email address and any other user details and generate an ID. However, you can also simply accept any email address by skipping the lookup and just calling `callback(null, user)`.

If you have just a fixed list of users do the following:
```javascript
// GET login as above

var users = [
	{ id: 1, email: 'marc@example.com' },
	{ id: 2, email: 'alice@example.com' }
];

/* POST login details. */
router.post('/sendtoken', 
	passwordless.requestToken(
		function(user, delivery, callback) {
			for (var i = users.length - 1; i >= 0; i--) {
				if(users[i].email === user.toLowerCase()) {
					return callback(null, users[i].id);
				}
			}
			callback(null, null);
		}),
		function(req, res) {
			// success!
		res.render('sent');
});
```

### 8. Login page
All you need is a form where users enter their email address, for example:
```html
<html>
	<body>
		<h1>Login</h1>
		<form action="/sendtoken" method="POST">
			Email:
			<br><input name="user" type="text">
			<br><input type="submit" value="Login">
		</form>
	</body>
</html>
```
By default, Passwordless will look for a field called `user` submitted via POST.

### 9. Protect your pages
You can protect all pages that should only be accessed by authenticated users by using the `passwordless.restricted()` middleware, for example:
```javascript
/* GET restricted site. */
router.get('/restricted', passwordless.restricted(),
 function(req, res) {
  // render the secret page
});
```
You can also protect a full path, by doing:
```javascript
router.use('/admin', passwordless.restricted());
```

### 10. Who is logged in?
Passwordless stores the user ID in req.user (at least by default). So, if you want to display the user's details or use them for further requests, do something like:
```javascript
router.get('/admin', passwordless.restricted(),
	function(req, res) {
		res.render('admin', { user: req.user });
});
```
You could also create a middleware that is adding the user to any request and enriching it with all the user details. Make sure, though, that you are adding this middleware after `acceptToken()` and `sessionSupport()`:
```javascript
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
```

### Conclusion
I hope this helps you getting started with your own app! If you need more details check out the [example](https://github.com/florianheinemann/passwordless/tree/master/examples/simple-mail), the [deep dive](https://passwordless.net/deepdive), or the [documentation](https://passwordless.net/docs/Passwordless.html). Also, don't hesitate to raise comments and questions on [GitHub](https://github.com/florianheinemann/passwordless/issues).
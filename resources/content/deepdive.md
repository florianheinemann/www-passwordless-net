### Logout
Just call `passwordless.logout()` as in:
```javascript
router.get('/logout', passwordless.logout(),
	function(req, res) {
		res.redirect('/');
});
```

### Redirects
Redirect non-authorized users who try to access protected resources with `failureRedirect` (default is a 401 error page):
```javascript
router.get('/restricted', passwordless.restricted({ failureRedirect: '/login' });
```

Redirect unsuccessful login attempts with `failureRedirect` (default is a 401 or 400 error page):
```javascript
router.post('/login', passwordless.requestToken(function(user, delivery, callback) {
	// identify user
}, { failureRedirect: '/login' }),
	function(req, res){
		// success
});
```

### Error flashes
Flashes are error messages that are pushed to the user e.g. after a redirect to display more details about an issue e.g. an unsuccessful login attempt. You need flash middleware such as [connect-flash](https://www.npmjs.org/package/connect-flash).

You can use them in any situation where you can use `failureRedirect` (see above). However, they can never be used without `failureRedirect`. As an example:
```javascript
router.post('/login', passwordless.requestToken(function(user, delivery, callback) {
	// identify user
}, { failureRedirect: '/login', failureFlash: 'This user is unknown!' }),
	function(req, res){
		// success
});
```

The error flashes are pushed onto the `passwordless` array. Check out the [connect-flash docs](https://github.com/jaredhanson/connect-flash) of to pull the error messages, but a typical scenario could look like this:

```javascript
router.get('/mistake',
	function(req, res) {
		var errors = req.flash('passwordless'), errHtml;
		for (var i = errors.length - 1; i >= 0; i--) {
			errHtml += '<p>' + errors[i] + '</p>';
		}
		res.send(200, errHtml);
});
```

### 2-step authentication (e.g. for SMS)
For some token-delivery channels you want to have the shortest possible token (e.g. for text messages). One way to do so is to transport only the token while keeping the UID in the session. In such a scenario the user would type in his phone number, hit submit, be redirected to another page where she has to type in the received token, and then hit submit another time. To achieve this, requestToken stores the requested UID in `req.passwordless.uidToAuth`. Putting it all together, take the following steps:

**1: Read out `req.passwordless.uidToAuth`**

```javascript
// Display a new form after the user has submitted the phone number
router.post('/sendtoken', passwordless.requestToken(function(...) { },
	function(req, res) {
  	res.render('secondstep', { uid: req.passwordless.uidToAuth });
});
```

**2: Display another form to submit the token submitting the UID in a hidden input**

```html
<html>
	<body>
		<h1>Login</h1>
		<p>You should have received a token via SMS. Type it in below:</p>
		<form action="/auth" method="POST">
			Token:
			<br><input name="token" type="text">
			<input type="hidden" name="uid" value="<%= uid %>">
			<br><input type="submit" value="Login">
		</form>
	</body>
</html>
```

**3: Allow POST to accept tokens**

```javascript
router.post('/auth', passwordless.acceptToken({ allowPost: true }),
	function(req, res) {
		// success!
});
```

### Successful login and redirect to origin
Passwordless supports the redirect of users to the login page, remembering the original URL, and then redirecting them again to the originally requested page when the token has been submitted. Due to the many steps involved, several modifications have to be undertaken:

**1: Set `originField` and `failureRedirect` for passwordless.restricted()**

Doing this will call `/login` with `/login?origin=/admin` to allow later reuse
```javascript
router.get('/admin', passwordless.restricted( { originField: 'origin', failureRedirect: '/login' }));
```

**2: Display `origin` as hidden field on the login page**

Be sure to pass `origin` to the page renderer.
```html
<form action="/sendtoken" method="POST">
	Token:
	<br><input name="token" type="text">
	<input type="hidden" name="origin" value="<%= origin %>">
	<br><input type="submit" value="Login">
</form>
```

**3: Let `requestToken()` accept `origin`**

This will store the original URL next to the token in the TokenStore.
```javascript
app.post('/sendtoken', passwordless.requestToken(function(...) { }, 
	{ originField: 'origin' }),
	function(req, res){
		// successfully sent
});
```

**4: Reconfigure `acceptToken()` middleware**

```javascript
app.use(passwordless.acceptToken( { enableOriginRedirect: true } ));
```

### Several delivery strategies
In case you want to use several ways to send out tokens you have to add several delivery strategies as shown below:
```javascript
passwordless.addDelivery('email', function(tokenToSend, uidToSend, recipient, callback) {
	// send the token to recipient
});
passwordless.addDelivery('sms', function(tokenToSend, uidToSend, recipient, callback) {
	// send the token to recipient
});
```
To simplify your code, provide the field `delivery` to your HTML page which submits the recipient details. Afterwards, `requestToken()` will allow you to distinguish between the different methods:
```javascript
router.post('/sendtoken', 
	passwordless.requestToken(
		function(user, delivery, callback) {
			if(delivery === 'sms')
				// lookup phone number
			else if(delivery === 'email')
				// lookup email
		}),
	function(req, res) {
  		res.render('sent');
});
```

### Modify lifetime of a token
```javascript
// Lifetime in ms for the specific delivert strategy
passwordless.addDelivery(function(tokenToSend, uidToSend, recipient, callback) {
	// send the token to recipient
}, { ttl: 1000*60*10 });
```
### Different tokens
Different token generators can be provided by:
```javascript
passwordless.addDelivery(function(tokenToSend, uidToSend, recipient, callback) {
	// send the token to recipient
}, {tokenAlgorithm: function() {return 'random'}});
```

### Stateless operation
Just remove `app.use(passwordless.sessionSupport());` middleware. Every request for a restricted resource has then to be combined with a token and uid. Please consider the limited lifetime of tokens. You might want to extend it in such cases.

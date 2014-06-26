## Faster to deploy
One form and one text field. That's all the frontend you need to let users authenticate via a token-based system. No need for separate registration, login, and lost password pages. In case you need to ask for more user details than just email addresses or phone numbers Passwordless will scale easily.

If you only have a handful of users (e.g. for your own blog) you could even skip the user database and just hardcode the relevant email addresses without opening you up to the same risks as hardcoding passwords.

## Better for your users
Type in an email address, click on the provided link, and the users are ready to go. No passwords to invent or to remember. Exactly the same when a user returns to your site. This eliminates a big hurdle to get them started with your app.

## Better security
'12345', 'password', ... Inventing great passwords is hard. So many users still [don't do it](http://www.wired.com/2013/12/web-semantics-the-ten-thousand-worst-passwords/). Worse: the same passwords are repeated across several websites, so if one of the sites is broken all of the user's accounts are broken simultaneously.

In addition, rather than splitting your attention on both the login page and the lost password page (which is often much less hardened), you can focus your security-minded energy on just one path.

The tokens (or "one-time passwords") are very [hard to guess](http://en.wikipedia.org/wiki/Universally_unique_identifier), are only valid for a limited time and can be reset at any time without having to ask your uses to create a new password (remember those emails you got from big companies asking you to think of a new password due to a hack?).

## Flexible
Deliver your tokens via email, text messages (SMS), or smoke signs. You can embed [Sendgrid](http://sendgrid.com/), [emailjs](https://github.com/eleith/emailjs), [Twilio](https://www.twilio.com/), or any other framework you like to get the token to your user.

While having sensible defaults, you can tweak almost anything. Redirects, error messages, field names, ... Check out all the details in the [deep dive](/deepdive) section or have a look at the [docs](https://passwordless.net/docs/Passwordless.html).
## Faster for you
One form and one text field. That's all the frontend you need to have your user egistration and authentication solved. No need for separate registration, login, and lost password pages. If you need more user details, Passwordless will scale easily.

If you only have a handful of users (e.g. for your own blog) you can even skip the user database and just hardcode the relevant email addresses without opening you up to any security risks.

## Better for your users
Type in an email address, click on the provided link, and your users are ready to go. No passwords to invent or to remember. Exactly the same when a user returns to your site. This eliminates a big hurdle to get them on board.

## Better security
'12345', 'password', ... Inventing great passwords is hard. So many users still [don't do it](http://www.wired.com/2013/12/web-semantics-the-ten-thousand-worst-passwords/). Worse: the same passwords are repeated across several websites, so if one site is broken all the user's accounts are broken simultaneously.

In addition, rather than splitting your attention on both the login page and the lost password page, you can focus your security-minded energy on just one path.

The used tokens are extremely [hard to guess](href='http://en.wikipedia.org/wiki/Universally_unique_identifier), are only valid for a limited time and can be reset at any time without having to ask your uses for creating a new password.

## Flexible
Deliver your tokens via email, text messages (SMS), or smoke signs. You can embed [Sendgrid](http://sendgrid.com/), [emailjs](https://github.com/eleith/emailjs), [Twilio](https://www.twilio.com/), or any other framework to get the token to your user.

While having sensible defaults, you can tweak almost anything. Redirects, error messages, field names, ... Check out all the details in the [deep dive](/deepdive) section or have a look at the [API](/api).

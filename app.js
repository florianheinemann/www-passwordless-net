var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongostore')(session);
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var enforce = require('express-sslify');

var config = require('./config');
var passwordless = require('./controller/passwordless');

var routes = require('./routes/index');
var users = require('./routes/users');
var account = require('./routes/account');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

if(config.http.enforce_ssl) {
    app.use(enforce.HTTPS(config.http.trust_proxy));
}

app.use(favicon('public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(expressValidator());
expressValidator.validator.extend('toLowerCase', function (str) { return str.toLowerCase(); });

// Google Analytics
if(config.ga.id && config.ga.domain) {
    app.use(function(req, res, next) {
        res.locals.ga = config.ga;
        next();
    });
}

app.use(cookieParser(config.http.cookie_secret));
app.use(session({   secret: config.http.cookie_secret,
                    cookie: {maxAge: 60*60*24*365*10},
                    store: new MongoStore( { db: config.mongodb.database,
                                            host: config.mongodb.host,
                                            port: config.mongodb.port,
                                            username: config.mongodb.user, 
                                            password: config.mongodb.password })}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

passwordless(app);

app.use('/', routes);
app.use('/account', account);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

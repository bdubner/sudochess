
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require("express-session");
var okta = require("@okta/okta-sdk-nodejs");
var ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;
const serialport = require("serialport");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var playRouter  = require('./routes/play');

var app = express();
var oktaClient = new okta.Client({
  orgUrl: 'https://dev-7698043.okta.com',
  token: '00QzhkFFYvKsZWwml4MJEzrX_SPIKj64tjW3mtTlcY'
});
const oidc = new ExpressOIDC({
  appBaseUrl: "http://localhost:3000",
  issuer: "https://dev-7698043.okta.com/oauth2/default",
  client_id: "0oahudnthRGwlgvxb5d5",
  client_secret: "YsbVzMnx8g5N45Pn388rOXmxqgZ3fjPnlJtBFu_L",
  redirect_uri: 'http://localhost:3000/play',
  scope: "openid profile",
  routes: {
    login: {
      path: "/users/login"
    },
    callback: {
      path: "/users/callback/",
      defaultRedirect: "/play"
    }
  }
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'a8ej34ER31HNDGF30nYY4HP',
  resave: true,
  saveUninitialized: false
}));
app.use(oidc.router);
app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }

  oktaClient.getUser(req.userinfo.sub)
      .then(user => {
        req.user = user;
        res.locals.user = user;
        next();
      }).catch(err => {
    next(err);
  });
});

function loginRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).render("unauthenticated");
  }

  next();
}

app.use('/', indexRouter);
app.use('/login',loginRouter);
app.use('/play',loginRequired,playRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

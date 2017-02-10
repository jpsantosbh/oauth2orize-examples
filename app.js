/**
 * Module dependencies.
 */
var express = require('express')
  , passport = require('passport')
  , bodyParser = require('body-parser')
  , site = require('./site')
  , oauth2 = require('./oauth2')
  , user = require('./user')
  , client = require('./client')
  , util = require('util')
  , civic = require('./civic')
  
  
// Express configuration
  
var app = express.createServer();
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(express.cookieParser());
//app.use(express.bodyParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.session({ secret: 'keyboard cat' }));
app.use(bodyParser.json())
/*
app.use(function(req, res, next) {
  console.log('-- session --');
  console.dir(req.session);
  //console.log(util.inspect(req.session, true, 3));
  console.log('-------------');
  next()
});
*/
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

// Passport configuration

require('./auth');


app.get('/', site.index);
app.get('/login', civic.LoginForm);
app.post('/scoperequest/:requestId', civic.scopeRequestCallback);
app.get('/jwt', civic.jwt);
app.post('/login', site.login);
app.get('/logout', site.logout);
app.get('/account', site.account);

app.post('/loginjwt', passport.authenticate('jwt', { successReturnToOrRedirect: '/',
  failureRedirect: '/login',
  session: true }
));

app.get('/dialog/authorize', oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);
app.post('/oauth/token', oauth2.token);

app.get('/api/userinfo', user.info);
app.get('/api/clientinfo', client.info);

app.listen(3000);

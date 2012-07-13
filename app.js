/*
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var connect = require('connect');

var plays = require('./routes/plays');
var collections = require('./routes/collections')
var app = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  connect();
  app.use(express.cookieParser(process.env.COOKIE_SECRET));
  app.use(express.session({ key: process.env.SESSION_SECRET}));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.get('/*', plays.getAsset);

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", port, app.settings.env);

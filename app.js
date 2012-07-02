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
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({ key: 'smelly cat'}));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.get('/collections/', collections.getCollections);
app.get('/*', plays.getAsset);

http.createServer(app).listen(3000);

console.log("Express server listening on port 3000");

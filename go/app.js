var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forwarding to error handler
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

// Start

var server = require('http').createServer(app);
var port = 3000;
server.listen(port);

sio = require('socket.io').listen(server);

sio.on('connection', function(socket) {
	console.log("Client connected");

	data = [
	    { id: '1', timestamp: {year: 2015, month: 4, day: 30, hour: 2, min: 3, second: 01}, score: {team_1: -4, team_2: +5}},
	    { id: '2', timestamp: {year: 2015, month: 5, day: 1, hour: 2, min: 3, second: 03},  score: {team_1: 2, team_2: 0}},
	    { id: '3', timestamp: {year: 2015, month: 5, day: 1, hour: 2, min: 3, second: 04},  score: {team_1: 1, team_2: 2}},
	    { id: '4', timestamp: {year: 2015, month: 5, day: 2, hour: 2, min: 3, second: 08},  score: {team_1: -2, team_2: 5}}, 
	    { id: '5', timestamp: {year: 2015, month: 5, day: 2, hour: 3, min: 14, second: 33}, score: {team_1: 0, team_2: 4}},
	    { id: '6', timestamp: {year: 2015, month: 5, day: 2, hour: 5, min: 44, second: 33}, score: {team_1: 1, team_2: -4}}
	];

	console.log(data);

	for (t in data) {
		socket.emit("tweet_data", data[t]);
	}
	

});


// End

module.exports = app;


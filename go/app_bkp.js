// Keys from ~/.bashrc file
var twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
var twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
var twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN;
var twitterAccessSecret = process.env.TWITTER_ACCESS_SECRET;

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sentiment = require('sentiment');
//var async = require("async");
var twitter = require('twitter');
var Promise = require('bluebird');
var fs = require('fs');
var json_obj = require('json');
var HashMap = require('hashmap');
var LineByLineReader = require('line-by-line');
var Heap = require('heap');

var love_words = 0;
var hate_words = 0;
var total_words = 0;
var love_per, hate_per;
var routes = require('./routes/index');
var users = require('./routes/users');
var score_map = new HashMap();
var geo_map = new HashMap();
var Twit = require('twit');
// Twit Initialization

console.log("start");

var app = express();
var server = require('http').createServer(app);
var port = 3000;
server.listen(port);
console.log("Socket.io server listening at http://127.0.0.1:" + port);

// Listen to Client requests
var sio = require('socket.io').listen(server);

var heap_retweet = new Heap(function(a,b){
	return a.no_retweet - b.no_retweet;
});

lr = new LineByLineReader('batch/final_file_to_read',{ encoding: 'utf8' });

lr.on('error',function(err){
	console.log("Error in reading")
});

/*
lr.on('end',function (){
	var list_date_obj = score_map.keys();

	for(var i=0; i<list_date_obj.length; i++)
	{
		var score_obj = score_map.get(list_date_obj[i]);
	
		if(score_obj.team_1 != 0 && score_obj.team_2 != 0)
		{
			console.log(JSON.stringify(list_date_obj[i]), " " + JSON.stringify(score_obj));
		}
	}
});

lr.on('end',function(){
	var heap_array = heap_retweet.toArray();
	heap_array = heap_array.sort(function(a,b){
		return b.no_retweet - a.no_retweet;
	});
	console.log("Inside end func");
	for(var i=0; i < heap_array.length;i++)
		console.log("Heap- " + JSON.stringify(heap_array[i]));
});
*/

lr.on('line',function(line){
	var obj = JSON.parse(line);

	//console.log("Inside read line by line");
	var date = new Date(obj.created_at);
	var date_obj = {};
	date_obj.year = date.getFullYear();
	date_obj.month = date.getMonth() + 1;
	date_obj.day = date.getDate();
	date_obj.hour = date.getHours();
	date_obj.min = date.getMinutes();
	date_obj = JSON.stringify(date_obj);

	var text_str = obj.text.toLowerCase();
	var sentiment_results = sentiment(text_str);
	var team1 = text_str.search('rcb');
	var team2 = text_str.search('kkr');

	var score = sentiment_results.score;

	if(score != 0)
	{
		if(team1 != -1 && team2 == -1) // Tweet about team 1 only
		{
			insert_into_map(score,1,date_obj);
		}

		if(team2 != -1 && team1 == -1) // Tweet about team 2 only
		{
			insert_into_map(score,2,date_obj);
		}
	}
	
	var no_retweet = obj.retweet_count;
	var retweeted_status = obj.retweeted_status;
	if(no_retweet > 0 && retweeted_status == null)
	{
		var retweet_obj = {};
		retweet_obj.text = text_str;
		retweet_obj.tweet_id = obj.id_str;
		retweet_obj.user_id = obj.user.id;
		retweet_obj.user_name= obj.user.screen_name;
		retweet_obj.no_retweet = no_retweet;

	//	console.log(JSON.stringify(retweet_obj));
		
		if(heap_retweet.size() >= 10)
		{
			heap_retweet.push(retweet_obj);
			heap_retweet.heapify();
			heap_retweet.pop();
		}
		else
		{
			heap_retweet.push(retweet_obj);
		}
	}
});

function insert_into_map(score, team_no, date_obj)
{
	if(score_map.has(date_obj))
	{
		score_obj = score_map.get(date_obj);
		
		if(team_no == 1)
		{
			score_obj.team_1 = score_obj.team_1 + score;
		}
		else
		{
			score_obj.team_2 = score_obj.team_2 + score;
		}

		score_map.set(date_obj,score_obj);
	}
	else
	{
		var score_obj = {};
		if(team_no == 1)
		{
			score_obj.team_1 = score;
			score_obj.team_2 = 0;
		}
		else
		{
			score_obj.team_1 = 0;
			score_obj.team_2 = score;
		}

		score_map.set(date_obj,score_obj);
	}
};

sio.sockets.on('connection', function(socket){

	console.log('Web client connected');

	var list_date_obj = score_map.keys();

	for(var i=0; i<list_date_obj.length; i++)
	{
		var score_obj = score_map.get(list_date_obj[i]);
		var obj_data = {};
		obj_data.timestamp = JSON.parse(list_date_obj[i]);
		obj_data.score = score_obj;
		if (!(obj_data.score.team_1 > 100 || obj_data.score.team_2 > 100))
			socket.emit('tweet_data', obj_data);
	}

	socket.emit('top_tweets',heap_retweet.toArray().sort(function(a,b){
		return b.no_retweet - a.no_retweet;
	}));

	/*
	setInterval(function() {
	//	console.log('Stats to Client send');
		socket.emit('statsToClient', score_map);
	},3000);

	*/
//		var sentimental_results = sentimental.analyze(tweet.text.toLowerCase())
//		console.log("Sentimental" + sentimental_results);

/*		total_words = total_words +1;
		
		if(love != -1){
			love_words = love_words +1;
			socket.volatile.emit("LovetweetsToClient",JSON.stringify({ name: tweet.user.screen_name , text: tweet.text }));
		}
		else if(hate != -1){
			hate_words = hate_words +1;
			socket.volatile.emit("HatetweetsToClient",JSON.stringify({ name: tweet.user.screen_name , text: tweet.text }));
		}
// Calculating the percentage
		love_per = (love_words/total_words) * 100;
		hate_per = 100 - love_per;
		
});
	setInterval(function() {
	//	console.log('Stats to Client send');
		socket.emit('statsToClient', JSON.stringify({ total_words: total_words , love_per: love_per , hate_per: hate_per}));
	},3000);

*/
	socket.on('disconnect', function() {
	console.log('Web client disconnected');	
	});
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

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

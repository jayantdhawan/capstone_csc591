// Modules Required

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sentiment = require('sentiment');
var fs = require('fs');
var json_obj = require('json');
var HashMap = require('hashmap');
var LineByLineReader = require('line-by-line');
var Heap = require('heap');
var routes = require('./routes/index');
var users = require('./routes/users');

// Map to store the total sentiment score for both teams per minute
var score_map = new HashMap();

// Array to store the geographical location of the users tweeting about team 1.
var geo_team1 = [];
// Array to store the geographical location of the users tweeting about team 2.
var geo_team2 = [];

// Getting the server ready to accept connection on localhost and port 3000.
var app = express();
var server = require('http').createServer(app);
var port = 3000;
server.listen(port);
console.log("Socket.io server listening at http://127.0.0.1:" + port);

// Listen to Client requests
var sio = require('socket.io').listen(server);

// Creating the Heap to store the top-k famous tweets.
var heap_retweet = new Heap(function(a,b){
	return a.no_retweet - b.no_retweet;
});

// Creating the lineReader object to read the tweets one by one from file without storing all of them in memory.
lr = new LineByLineReader('batch/final_file_to_read',{ encoding: 'utf8' });

// Error handling if file not found
lr.on('error',function(err){
	console.log("Error in reading")
});

var file_processed = false;

lr.on('end',function(){
	file_processed = true;
});

//Setting the value of top-k to 10;
var topk_value = 10;

// Event handler to read the file line by line and process them.
lr.on('line',function(line){

// Converting the tweet received to JSON object
	var obj = JSON.parse(line);
// From the tweet created_date, fetch the year, month, date, hour, minute.
	var date = new Date(obj.created_at);
	var date_obj = {};
	date_obj.year = date.getFullYear();
	date_obj.month = date.getMonth() + 1;
	date_obj.day = date.getDate();
	date_obj.hour = date.getHours();
	date_obj.min = date.getMinutes();
// Stringify the JSON object so that Hashmap can be processed faster. 
	date_obj = JSON.stringify(date_obj);

// Converting the text to lower case and apply the sentimant analysis to it.
	var text_str = obj.text.toLowerCase();
	var sentiment_results = sentiment(text_str);
	var team1 = text_str.search('rcb');
	var team2 = text_str.search('kkr');
	var score = sentiment_results.score;

// If the score returned by sentiment analyser is non zero then process the tweets for sentiment.
	if(score != 0)
	{
		if(team1 != -1 && team2 == -1) // Tweets about team 1 only
		{
			insert_into_map(score,1,date_obj);
		}

		if(team2 != -1 && team1 == -1) // Tweets about team 2 only
		{
			insert_into_map(score,2,date_obj);
		}
	}

// Fetching the re-tweet data from the tweet 	
	var no_retweet = obj.retweet_count;
	var retweeted_status = obj.retweeted_status;

// If the count of retweet is more than zero and it is the original tweet (i.e. retweeted_status is NULL) then process them for getting the top-k retweets.
	if(no_retweet > 0 && retweeted_status == null)
	{

// Creating the object to store the tweet information needed by the client to display the tweet using the Twitter JS. 
		var retweet_obj = {};
		retweet_obj.text = text_str;
		retweet_obj.tweet_id = obj.id_str;
		retweet_obj.user_id = obj.user.id;
		retweet_obj.user_name= obj.user.screen_name;
		retweet_obj.no_retweet = no_retweet;
		retweet_obj.user = obj.user.name;

// Maintaining the heap to store only the top-k tweets with maximum retweet count
		if(heap_retweet.size() >= topk_value)
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

// Storing the geo co-ordinates from the tweets to diplay geographically users on the map.

	var location_user = obj.geo;

	if(location_user != null)
	{
		location_user = location_user.coordinates;

	// String the co-ordinates for users tweeting about team 1 and team 2.

		if(!(location_user[0] == 0 && location_user[1] == 0))
		{
			if(team1 != -1 && location_user) // RCB
			{
				geo_team1[geo_team1.length] = location_user;
			}

			if(team2 != -1) // KKR
			{
				geo_team2[geo_team2.length] = location_user;
			}
		}
	}
});

// Function to maintain the score_map based on the score and the time.
function insert_into_map(score, team_no, date_obj)
{
// If key already exists, then add the score to previously stored value for the given team or create the new key with value as score for given team.
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

// On accepting connection from client.
sio.sockets.on('connection', function(socket){

	console.log('Web client connected');

// Store all the keys from score_map and send each key-value pair one by one to client.
	
// Emit the sentiment score data to client.
	setTimeout(send_to_socket, 1000,socket);
		// Emit the Geographical data for both teams to client.
	
// Event handler if the client is disconnectd.

	socket.on('disconnect', function() {
	console.log('Web client disconnected');	
	});
});

function send_to_socket(socket)
{

	if(!file_processed)
	{
		setTimeout(send_to_socket, 1000,socket);
		return;
	}
	else
	{
		setTimeout(function() {

			var list_date_obj = score_map.keys();
			for(var i=0; i<list_date_obj.length; i++)
			{
				// Fetching the value from the give key.
				var score_obj = score_map.get(list_date_obj[i]);
				var obj_data = {};
				obj_data.timestamp = JSON.parse(list_date_obj[i]);
				obj_data.score = score_obj;
				//if (!(obj_data.score.team_1 > 100 || obj_data.score.team_2 > 100))
				// Emit the score for both team to the cleint.
				socket.emit('tweet_data', obj_data);
			}
		},150);

		//Emit the top-k tweets data to client
		setTimeout(function(){
			socket.emit('top_tweets',heap_retweet.toArray().sort(function(a,b){
				return b.no_retweet - a.no_retweet;
			}));
		},400);

		setTimeout(function() {
			socket.emit('geo_data_team1',geo_team1);
			socket.emit('geo_data_team2',geo_team2);
		},10);
	}
};

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
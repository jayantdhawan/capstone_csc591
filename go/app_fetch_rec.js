// Keys from ~/.bashrc file
var twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
var twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
var twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN;
var twitterAccessSecret = process.env.TWITTER_ACCESS_SECRET;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sentiment = require('sentiment');
//var sentimental = require('Sentimental');
async = require("async");
var twitter = require('twitter');
var Promise = require('bluebird');
var fs = require('fs');

var love_words = 0;
var hate_words = 0;
var total_words = 0;
var love_per, hate_per;
var routes = require('./routes/index');
var users = require('./routes/users');

var Twit = require('twit');
// Twit Initialization
var Tweets = new Twit({
	consumer_key:	twitterConsumerKey
	,consumer_secret:	twitterConsumerSecret
	,access_token:	twitterAccessToken
	,access_token_secret:	twitterAccessSecret
})

var config = {
	consumer_key:	twitterConsumerKey
	,consumer_secret:	twitterConsumerSecret
	,access_token:	twitterAccessToken
	,access_token_secret:	twitterAccessSecret
};

var twitterClient = new twitter(config);

function twitterSearchAsync(search,options) {
	return new Promise(function(resolve,reject){
		//console.log(search + options);
		Tweets.get('search/tweets',options , function(err, data, response){
		//	console.log("Success twitter",data);
			resolve(data);
		});
	})
}

var options = {};
options.q= 'RCB OR KKR';
options.count= 100;
options.lang= 'en';
options.until = '2015-05-03';
options.max_id = 594494108372049900;

var results= [];
var size=0;
var count = 0;

console.log("start");

/*
if(fs.existsSync("tweets.txt"))
{

	fs.unlinkSync("tweets.txt");
	twitterSearchAsync('search/tweets',options).then(getMaxHistory);
}
else
{
	twitterSearchAsync('search/tweets',options).then(getMaxHistory);
}
*/

fs.readFile("batch/final_file",'utf-8',function(err, data){
	if(err) throw err;

	var lines = data.trim().split("\n");

	for(var i=lines.length-1; i>=0; i--)
	{
		var data_to_write = lines[i] + "\n";
		fs.writeFileSync("batch/final_file_to_read",data_to_write,{flag: 'a'});
		console.log("Record - "+ i);
	}
	
});

//fs.writeFileSync("tweets.txt",'[',{flag: 'a'});

//fs.writeFileSync("tweets.txt",']',{flag: 'a'});
//console.log("Done");
/*
fs.writeFile("tweets.txt",']',{flag: 'a'},function(err){
	if(err) throw err;
	console.log("Saved!!");
});
*/

function getMaxHistory(data) {
	var max_id, options,oldest,newest;
	stat = data.statuses;
	if(stat.length > 0) {
		max_id = stat[stat.length-1].id -1;
		options = {};
		options.count = 100;
		options.max_id = max_id;
		options.q = 'RCB OR KKR';
		options.lang= 'en';
		options.until = '2015-05-03';
		newest = stat[0].created_at;
		oldest = stat[stat.length -1].created_at;

		results[size] = data;
		size++;
		
	/*	if(count != 0)
		{
			fs.writeFileSync("tweets.txt",',',{flag: 'a'});
		}
	*/
		for(var i=0;i<data.statuses.length;i++)
		{
			var data_to_write = JSON.stringify(data.statuses[i]) + "\n";
			fs.writeFileSync("tweets.txt",data_to_write,{flag: 'a'});
		}
	}
	count++;
	console.log("requests " + count+" " + max_id + oldest + newest);

	if(stat.length < 2 ) {
		//console.log(response);
		console.log(size);

		for(var i =0;i<size;i++)
		{
			console.log(results[i].statuses[0].created_at +" "+ results[i].statuses[results[i].statuses.length-1].created_at);
		}

	}
	else {
		twitterSearchAsync('search/tweets',options).then(getMaxHistory);
	}
}
/*
params = {screen_name: 'nodejs'};
twitterClient.get('statuses/user_timeline',params,function(error,tweets,response){
	console.log(tweets);
});
*/
// Getting Tweet Stream containing only words {Love, Hate}

//var stream = Tweets.stream('statuses/filter', { track : ['IPL8', 'CSK', 'SRH'] });
//var stream = Tweets.stream('statuses/filter', { track : ['love', 'hate']});
var maxid, sinceid;
/*
Tweets.get('search/tweets', { q: 'ipl8, CSK, SRH', count: 3}, function(err, data, response){
	maxid = data.search_metadata.max_id;
	sinceid = data.search_metadata.since_id;
	console.log(data);
	console.log("Max- "+maxid+"Since- "+sinceid); 
});
*/
var loop = 10;
maxid = sinceid = 0;
/*
	Tweets.get('search/tweets', { q: 'ipl8, CSK, SRH', count: 3, since_id: maxid}, function(err, data, response){
		maxid = data.search_metadata.max_id;
		sinceid = data.search_metadata.since_id;
		console.log("Max- "+maxid+"Since- "+sinceid); 
	});
*/
var app = express();
var server = require('http').createServer(app);
var port = 3000;
server.listen(port);
console.log("Socket.io server listening at http://127.0.0.1:" + port);

// Listen to Client requests
var sio = require('socket.io').listen(server);
var json_obj = require('json');
sio.sockets.on('connection', function(socket){

	console.log('Web client connected');
	socket.emit('ss-confirmation1', {text: 'Successfully connected'});
// On receiving tweets from the server, differentiate them as a Love or Hate tweet

/*	stream.on('tweet',function(tweet){
		//console.log(tweet.user.screen_name + " - " + tweet.text);
		var csk = tweet.text.toLowerCase().search("love");
		var srh = tweet.text.toLowerCase().search("hate");

		var sentiment_results = sentiment(tweet.text.toLowerCase());
		//console.log(tweet);
		if(csk != -1)
		{
			//console.log("CSK - " + tweet + "Result - " + sentiment_results.score + " " + sentiment_results.comparative + " " + sentiment_results.words + "Pos- " + sentiment_results.positive + "Neg- " + sentiment_results.negative);
			var date = new Date(tweet.created_at);
			console.log("Date" + date.getMinutes());
		}

		if(srh != -1)
		{
			console.log("SRH - " + tweet.text + "Result - " + sentiment_results.score + " " + sentiment_results.comparative + " " + sentiment_results.words + "Pos- " + sentiment_results.positive + "Neg- " + sentiment_results.negative);
		}


//		var sentimental_results = sentimental.analyze(tweet.text.toLowerCase())
//		console.log("Sentimental" + sentimental_results);

		total_words = total_words +1;
		
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

// Twitte Auth keys from ~/.bashrc file
var twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
var twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
var twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN;
var twitterAccessSecret = process.env.TWITTER_ACCESS_SECRET;

// Modules Required
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sentiment = require('sentiment');
var twitter = require('twitter');
var Promise = require('bluebird');
var fs = require('fs');
var routes = require('./routes/index');
var users = require('./routes/users');
var Twit = require('twit');

// Creating the Tweets object to get the tweets from Twitter

var Tweets = new Twit({
	consumer_key:	twitterConsumerKey
	,consumer_secret:	twitterConsumerSecret
	,access_token:	twitterAccessToken
	,access_token_secret:	twitterAccessSecret
})

// Function to get the historical twitter feeds using the Twitter REST API 
function twitterSearchAsync(search,options) {
	return new Promise(function(resolve,reject){
		Tweets.get('search/tweets',options , function(err, data, response){
		//Sending the data back to the caller
			resolve(data);
		});
	});
};

// Setting up options  for fetching the tweets.
var options = {};
options.q= 'RCB OR KKR';
// Count can be maximum 100 only.
options.count= 100;
options.lang= 'en';
options.until = '2015-05-03';
//options.max_id = 594494108372049900;

var results= [];
var size=0;
var count = 0;

console.log("start");

// Event to call the function to extract the tweets.
// *** Must be commented if tweets are received and now trying to arrange the tweets in increasing order of time i.e. oldest tweet first.

if(fs.existsSync("batch/tweets.txt"))
{

	fs.unlinkSync("batch/tweets.txt");
	twitterSearchAsync('search/tweets',options).then(getMaxHistory);
}
else
{
	twitterSearchAsync('search/tweets',options).then(getMaxHistory);
}

// Function to extract tweets recursively, until all the tweets are received or the limit of 180 requests is reached
function getMaxHistory(data) {
	var max_id, options,oldest,newest;
	stat = data.statuses;
	if(stat.length > 0) {
		max_id = stat[stat.length-1].id -1;
	// Setting up the options to receive the next batch of tweets.
		options = {};
		options.count = 100;
		// max_id is used to avoid receiving the same tweets again.
		options.max_id = max_id;
		options.q = 'RCB OR KKR';
		options.lang= 'en';
		options.until = '2015-05-03';
		newest = stat[0].created_at;
		oldest = stat[stat.length -1].created_at;

		results[size] = data;
		size++;

	// Writing the tweets received to the file, each tweet per line	
		for(var i=0;i<data.statuses.length;i++)
		{
			var data_to_write = JSON.stringify(data.statuses[i]) + "\n";
			fs.writeFileSync("batch/tweets.txt",data_to_write,{flag: 'a'});
		}
	}
	count++;
	console.log("requests " + count+" " + max_id + oldest + newest);

// Cheching if more tweets are there or we have received all the tweets
	if(stat.length < 2 ) {

		for(var i =0;i<size;i++)
		{
			console.log(results[i].statuses[0].created_at +" "+ results[i].statuses[results[i].statuses.length-1].created_at);
		}

	}
	else {
		twitterSearchAsync('search/tweets',options).then(getMaxHistory);
	}
}

// After receving all the tweets, the tweets are saved in increasing order of time. i.e. oldest tweet will be the first
// **** Should be run after the tweets are received and saved to the file batch/final_file ***

/*
fs.readFile("batch/final_file",'utf-8',function(err, data){
	
	if(err) throw err;
	var lines = data.trim().split("\n");

	for(var i=lines.length-1; i>=0; i--)
	{
		line = JSON.parse(lines[i]);
		var date = new Date(line.created_at);
	//	console.log("Record - "+ date.getDate() + " " + date.getHours());
		if(date.getDate() == 2 &&(date.getHours() >=9 && date.getHours() < 16))
		{
			var data_to_write = lines[i] + "\n";
			fs.writeFileSync("batch/final_file_to_read_test",data_to_write,{flag: 'a'});
			console.log("Record Insert- "+ i);
		}
	}
});
*/
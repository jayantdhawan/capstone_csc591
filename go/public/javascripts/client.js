
var data, chart, options;
var geo_chart_data, geo_chart_options, geo_chart;
var tweet_q_n = 0, tweet_q = [];

chart_bubble_init();
chart_geo_init();

function chart_bubble_init() {

  $("#top_plot_loading").show();

  // Load the Visualization API and the corechart package.
  google.load('visualization', '1.0', {'packages':['corechart']});
  // Set a callback to run when the Google Visualization API is loaded.
  google.setOnLoadCallback(drawBubbleChart);

  // Callback that creates and populates a data table,
  // instantiates the chart
  function drawBubbleChart() {
    //console.log("Chart loaded");
    data = new google.visualization.DataTable();
    data.addColumn('string', 'id');
    data.addColumn('datetime', 'time');
    data.addColumn('number', 'rank');
    data.addColumn('string', 'team');

    options = {
      width: 1100,
      height: 440,
      hAxis: {title: 'Time', format: 'MMM dd, hh:mm aa', gridlines : {count : 8},
              minorGridlines : {count : 1}},
      vAxis: {title: 'Sentiment'},
      bubble: {opacity: 0.5, textStyle: {fontSize: 1}},
      //animation: {duration: 20, startup: true},
      sizeAxis: {maxSize: 5},
      colorAxis: {legend: {position: 'in'}}
    };

    chart = new google.visualization.BubbleChart(document.getElementById('series_chart_div'));

    $("#series_chart_div").hide();

    //google.visualization.events.addListener(chart, 'animationfinish', updateBubbleChart);

    //chart.draw(data, options);
  }
}

function chart_geo_init () {
  // Load the Visualization API and the geochart package.
  google.load("visualization", "1", {packages:["geochart"]});
  // Set a callback to run when the Google Visualization API is loaded.
  google.setOnLoadCallback(drawRegionsMap);

  function drawRegionsMap() {
    geo_chart_data = new google.visualization.DataTable();

    geo_chart_data.addColumn('number', 'lat');
    geo_chart_data.addColumn('number', 'long');
    geo_chart_data.addColumn('number', 'color');
    //geo_chart_data.addColumn('number', 'size');

    geo_chart_options = {
        sizeAxis: { minSize: 3, maxSize: 3 },
        displayMode: 'markers',
        legend: 'none',
        region: 142,
        width: 1100,
        colorAxis: {values: [0, 1], colors: ['#e7711c', '#4374e0']} // orange to blue
    };

    geo_chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
  }
}


function updateBubbleChart(tweet_data) {

  $("#plot_loading").show();
  //$("#series_chart_div").text("");

  for (x in tweet_data) {
    id = tweet_data[x].id;
    timestamp = tweet_data[x].timestamp;
    team1_value = tweet_data[x].score.team_1;
    team2_value = tweet_data[x].score.team_2;
    timestamp.second = 0;

    //console.log(new Date(timestamp.year, timestamp.month - 1, timestamp.day, timestamp.hour, timestamp.min, timestamp.second));

    data.addRow([id, 
      new Date(timestamp.year, timestamp.month - 1, timestamp.day, timestamp.hour, timestamp.min, timestamp.second),
      team1_value, 'RCB']);
    data.addRow([id,
      new Date(timestamp.year, timestamp.month - 1, timestamp.day, timestamp.hour, timestamp.min, timestamp.second),
      team2_value, 'KKR']);
  }
  //console.log("AFter: " + tweet_q_i + " " + tweet_q_n);
  chart.draw(data, options);

  $("#plot_loading").hide();
}

function updateBubbleChart_q() {

  if (tweet_q_n > 0)
    $("#top_plot_loading").show();
  else
    return;

  i = 0;
  while (i < tweet_q_n) {
    $("#count").text(i);
    id = tweet_q[i].id;
    timestamp = tweet_q[i].timestamp;
    team1_value = tweet_q[i].score.team_1;
    team2_value = tweet_q[i].score.team_2;
    timestamp.second = 0;

    //console.log(new Date(timestamp.year, timestamp.month - 1, timestamp.day, timestamp.hour, timestamp.min, timestamp.second));
    data.addRow([id, 
      new Date(timestamp.year, timestamp.month - 1, timestamp.day, timestamp.hour, timestamp.min, timestamp.second),
      team1_value, 'RCB']);
    data.addRow([id,
      new Date(timestamp.year, timestamp.month - 1, timestamp.day, timestamp.hour, timestamp.min, timestamp.second),
      team2_value, 'KKR']);

    i++;
  }

  if (tweet_q_n > 0) {
    $("#plot_loading").hide();
    $("#series_chart_div").show();
    chart.draw(data, options);
  }

  tweet_q_n = 0;
  tweet_q = [];
}

function displayTopTweets(top_tweets_array) {

  $("#top_tweets_loading").show();
  $("#top_tweets_left").text("");
  $("#top_tweets_right").text("");

  for (x in top_tweets_array) {
    tweet_box = '<blockquote class="twitter-tweet" lang="en"><p lang="en" dir="ltr">';
    tweet_box += top_tweets_array[x].text;
    tweet_box += '</p>&mdash; ' + top_tweets_array[x].user + ' (@' + top_tweets_array[x].user_name + ')';
    tweet_box += '<a href="https://twitter.com/'+top_tweets_array[x].user_name+'/status/'+top_tweets_array[x].tweet_id+
                  '"></a></blockquote><script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>';

    if (x % 2 == 0)
      $("#top_tweets_left").append(tweet_box);
    else
      $("#top_tweets_right").append(tweet_box);
  }

  $("#top_tweets_loading").hide();
}


//
// jQuery document.on(load) function
//
$(document).ready(function() {

  // Connect via Socket.IO
	sio = io();

  // Listener on the 'tweet_data' event
	sio.on('tweet_data', function(tweet_data) {
		//console.log(tweet_data);
    tweet_q[tweet_q_n] = tweet_data;
    tweet_q_n++;

    //updateBubbleChart(tweet_data);
	});

  // Listener on the 'top_tweets' event
  sio.on('top_tweets', function(top_tweets_array) {
    //console.log(top_tweets_array);
    displayTopTweets(top_tweets_array);
  });

  // Listener on the 'geo_data_team1' event for geocoding data of team 1
  sio.on('geo_data_team1', function(geo_data) {
        //console.log(geo_data);

        for(i =0; i<geo_data.length; i++)
          geo_chart_data.addRow([geo_data[i][0], geo_data[i][1],0]);

        geo_chart.draw(geo_chart_data, geo_chart_options);
  });

  // Listener on the 'geo_data_team2' event for geocoding data of team 2
  sio.on('geo_data_team2', function(geo_data) {
        for(i =0; i<geo_data.length; i++)
          geo_chart_data.addRow([geo_data[i][0], geo_data[i][1],1]);

        geo_chart.draw(geo_chart_data, geo_chart_options);
  })

  // Call updateBubbleChart every 1 ms
  //if (tweet_q_i > )
  setInterval(updateBubbleChart_q, 500);
});





//
// Google Chart
//

var data;
var chart;
var options;

// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawBubbleChart);

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawBubbleChart() {
  console.log("Chart loaded");
  data = new google.visualization.DataTable();
  data.addColumn('string', 'id');
  data.addColumn('datetime', 'time');
  data.addColumn('number', 'rank');
  data.addColumn('string', 'team');

  /*data.addRows([
    ['1', new Date(2015, 4, 30, 2, 3, 01), -4, 'RCB'], ['1', new Date(2015, 4, 30, 2, 3, 01), +5, 'KKR'], 
    ['1', new Date(2015, 5, 1, 2, 3, 03), 2, 'RCB'],     ['1', new Date(2015, 5, 1, 2, 3, 03), 0, 'KKR'],
    ['1', new Date(2015, 5, 1, 2, 3, 04), 1, 'RCB'],     ['1',new Date(2015, 5, 1, 2, 3, 04), 2, 'KKR'],
    ['1', new Date(2015, 5, 2, 2, 3, 08), -2, 'RCB'],  ['1',new Date(2015, 5, 2, 2, 3, 08), 5, 'KKR'], 
    ['1', new Date(2015, 5, 2, 3, 14, 33), 0, 'RCB'],     ['1',new Date(2015, 5, 2, 3, 14, 13), 4, 'KKR'],
    ['1', new Date(2015, 5, 2, 5, 44, 33), 1, 'RCB'],     ['1',new Date(2015, 5, 2, 5, 44, 33), -4, 'KKR']
  ]);*/

  options = {
    width: 1100,
    height: 440,
    hAxis: {title: 'Time', format: 'MMM dd, hh:mm aa', gridlines : {count : 8},
            minorGridlines : {count : 1}},
    vAxis: {title: 'Sentiment'},
    bubble: {opacity: 0.5, textStyle: {fontSize: 1}},
    //animation: {duration: 1, startup: true},
    sizeAxis: {maxSize: 5}
  };

  chart = new google.visualization.BubbleChart(document.getElementById('series_chart_div'));

  //yo = google.visualization.events.addListener(chart, 'animationfinish', updateBubbleChart);

  chart.draw(data, options);
}

var tweet_q_i = 0;
var tweet_q_n = 0;
var tweet_q = [];

$(document).ready(function() {

	sio = io();

	sio.on('tweet_data', function(tweet_data) {
		console.log(tweet_data);
    tweet_q[tweet_q_n] = tweet_data;
    tweet_q_n++;
	});

  setInterval(updateBubbleChart, 1);

  $("#container_most_retweeted").append('<blockquote class="twitter-tweet" lang="en"><p lang="en" dir="ltr">KKR batting. Last two balls. 1 run to win. &amp; commentator says now batsman should get out! Without any malice I want to say “ I hate u sir!”</p>&mdash; Shah Rukh Khan (@iamsrk) <a href="https://twitter.com/iamsrk/status/593843887719849984"></a></blockquote>');

  $("#container_most_retweeted").append('<blockquote class="twitter-tweet" lang="en"><p lang="en" dir="ltr">KKR batting. Last two balls. 1 run to win. &amp; commentator says now batsman should get out! Without any malice I want to say “ I hate u sir!”</p>&mdash; Shah Rukh Khan (@iamsrk) <a href="https://twitter.com/iamsrk/status/593843887719849984"></a></blockquote>');
  
});

function updateBubbleChart(/*id, timestamp, team1_value, team2_value*/) {
  if (tweet_q_i < tweet_q_n) {
    $("#count").text(tweet_q_i);

    for (i = 0; i < 1; i++) {
      id = tweet_q[tweet_q_i].id;
      timestamp = tweet_q[tweet_q_i].timestamp;
      team1_value = tweet_q[tweet_q_i].score.team_1;
      team2_value = tweet_q[tweet_q_i].score.team_2;
      timestamp.second = 0;

      //console.log(new Date(timestamp.year, timestamp.month - 1, timestamp.day, timestamp.hour, timestamp.min, timestamp.second));

      data.addRow([id, new Date(timestamp.year, timestamp.month - 1, timestamp.day, timestamp.hour, timestamp.min, timestamp.second), team1_value, 'RCB']);
      data.addRow([id, new Date(timestamp.year, timestamp.month - 1, timestamp.day, timestamp.hour, timestamp.min, timestamp.second), team2_value, 'KKR']);

      tweet_q_i++;
    }

    chart.draw(data, options);
  }
}


function drawScatterChart () {

        var data = new google.visualization.DataTable();
        data.addColumn('datetime', 'Student ID');
        data.addColumn('number', 'Hours Studied');
        data.addColumn('number', 'Final');

        data.addRows([
          [new Date(2015, 1, 1, 2, 3, 01), null, 67],  [new Date(2015, 1, 1, 2, 3, 02), 1, 88], 
          [new Date(2015, 1, 1, 2, 3, 03), 2, 77],
                [new Date(2015, 1, 1, 2, 3, 04), null, 67],  [new Date(2015, 1, 1, 2, 3, 05), 1, 88], 
          [new Date(2015, 1, 1, 2, 3, 06), 2, 77],
                [new Date(2015, 1, 1, 2, 3, 07), null, 67],  [new Date(2015, 1, 1, 2, 3, 08), 1, 88], 
          [new Date(2015, 1, 1, 2, 3, 09), 2, 77],
                [new Date(2015, 1, 1, 2, 3, 10), null, 67],  [new Date(2015, 1, 1, 2, 3, 11), 1, 88], 
          [new Date(2015, 1, 1, 2, 3, 12), 2, 77]
        ]);

        var options = {
          chart: {
            title: 'Sentiments analysis during the match',
          },
          hAxis: {
            format: 'M/d/yy',
            gridlines: {mincount: 10}
          },
          width: 1100,
          height: 500,
          series: {
            0: {axis: 'hours studied'},
            1: {axis: 'final grade'}
          },
          axes: {
            y: {
              'hours studied': {label: 'Hours Studied'},
              'final grade': {label: 'Final Exam Grade'}
            }
          },
          animation: {duration: 500, startup: true, easing: 'inAndOut'}
        };

    var chart = new google.charts.Scatter(document.getElementById('series_chart_div'));

  google.visualization.events.addListener(chart, 'error', function(err) {
    console.log(err);
  });


    var i = 0;
  var updateChart = function() {
    console.log(options.animation);
    i++;
    data.addRow([new Date(2015, 1, 1, 2, 3, 20+i), null, 67]);
    chart.draw(data, options);
  }

  //google.visualization.events.addListener(chart, 'animationfinish', updateChart);

    chart.draw(data, options);

    setInterval(updateChart, 2000);
}

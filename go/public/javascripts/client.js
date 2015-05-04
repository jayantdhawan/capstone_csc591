
//
// Google Chart stuff
//

// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {'packages':['scatter']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawChart);


function drawChart () {

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
            gridlines: {count: -1}
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

    var i = 0;
	var updateChart = function() {
		i++;
		data.addRow([new Date(2015, 1, 1, 2, 3, 39+i), null, 67]);
		chart.draw(data, options);
	}

	//google.visualization.events.addListener(chart, 'animationfinish', updateChart);

    chart.draw(data, options);

    setInterval(updateChart, 2000);
}


// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawSeriesChart() {
	alert("ASDA");
  var data = google.visualization.arrayToDataTable([
    ['ID', 'Life Expectancy', 'Fertility Rate', 'Region',     'Population'],
    ['CAN',    80.66,              1.67,      'North America',  33739900],
    ['DEU',    79.84,              1.36,      'Europe',         81902307],
    ['DNK',    78.6,               1.84,      'Europe',         5523095],
    ['EGY',    72.73,              2.78,      'Middle East',    79716203],
    ['GBR',    80.05,              2,         'Europe',         61801570],
    ['IRN',    72.49,              1.7,       'Middle East',    73137148],
    ['IRQ',    68.09,              4.77,      'Middle East',    31090763],
    ['ISR',    81.55,              2.96,      'Middle East',    7485600],
    ['RUS',    68.6,               1.54,      'Europe',         141850000],
    ['USA',    78.09,              2.05,      'North America',  307007000]
  ]);


  var options = {
    title: 'Correlation between life expectancy, fertility rate and population of some world countries (2010)',
    hAxis: {title: 'Life Expectancy'},
    vAxis: {title: 'Fertility Rate'},
    bubble: {textStyle: {fontSize: 11}},
    animation: {duration: 1000, startup: true}
  };

  var chart = new google.visualization.BubbleChart(document.getElementById('series_chart_div'));

	var i = 0;
 var drawChart = function() {
 	i++;
 	data.addRow(['India', 88+i, 0.3, 'Asia', 234234234]);
  	chart.draw(data, options);
  }

  //google.visualization.events.addListener(chart, 'animationfinish', drawChart);

  chart.draw(data, options);


}




$(document).ready(function() {

	sio = io();

	sio.on('tweet_info', function(data) {
		console.log(data.timestamp);
	});

});